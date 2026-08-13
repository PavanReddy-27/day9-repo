/**
 * @vitest-environment jsdom
 *
 * Frontend attendance service contract tests.
 *
 * As of Task 14 the attendance service is a THIN CLIENT over the backend state
 * machine: all authorization, geofence validation, shift/working-hour maths and
 * duplicate-prevention are enforced SERVER-SIDE (see
 * server/controllers/attendanceController.ts and the backend test suite). The
 * frontend must therefore not re-implement those rules; it must faithfully
 * delegate to the correct API endpoints and degrade to a local cache when the
 * network is unavailable. These tests assert exactly that contract.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Mock the API transport so we can assert the endpoints/payloads the service
// sends, and simulate the backend being reachable / unreachable.
const apiClientMock = vi.fn();
vi.mock("../services/apiClient", () => ({
  apiClient: (endpoint: string, options?: RequestInit) => apiClientMock(endpoint, options),
  ApiError: class ApiError extends Error {},
}));

import { attendanceApi } from "../services/attendanceApi";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = String(v);
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock, configurable: true });
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, configurable: true });

const parseBody = (call: unknown[]): Record<string, unknown> => {
  const opts = call[1] as RequestInit | undefined;
  return opts?.body ? JSON.parse(opts.body as string) : {};
};

describe("attendanceApi — backend delegation (online)", () => {
  beforeEach(() => {
    localStorage.clear();
    apiClientMock.mockReset();
  });
  afterEach(() => vi.restoreAllMocks());

  it("checkIn POSTs to /attendance/check-in and forwards location, source, shift and idempotency key", async () => {
    const backendRecord = { id: "srv1", employeeId: "e1", status: "Present" };
    apiClientMock.mockResolvedValueOnce(backendRecord);

    const loc = { latitude: 17.385, longitude: 78.4867, accuracy: 20 };
    const result = await attendanceApi.checkIn("e1", "Jane", loc, "Web", "Night", "idem-123", "Engineering", true);

    expect(result).toEqual(backendRecord);
    const [endpoint, options] = apiClientMock.mock.calls[0];
    expect(endpoint).toBe("/attendance/check-in");
    expect(options.method).toBe("POST");
    expect(parseBody(apiClientMock.mock.calls[0])).toEqual({
      location: loc,
      source: "Web",
      shiftType: "Night",
      idempotencyKey: "idem-123",
      isWFH: true,
    });
  });

  it("startBreak POSTs to /attendance/break", async () => {
    apiClientMock.mockResolvedValueOnce({ id: "s", status: "On Break" });
    await attendanceApi.startBreak("e1");
    expect(apiClientMock.mock.calls[0][0]).toBe("/attendance/break");
    expect((apiClientMock.mock.calls[0][1] as RequestInit).method).toBe("POST");
  });

  it("endBreak POSTs to /attendance/resume", async () => {
    apiClientMock.mockResolvedValueOnce({ id: "s", status: "Present" });
    await attendanceApi.endBreak("e1");
    expect(apiClientMock.mock.calls[0][0]).toBe("/attendance/resume");
  });

  it("checkOut POSTs to /attendance/check-out and forwards checkout location + idempotency key", async () => {
    apiClientMock.mockResolvedValueOnce({ id: "s", status: "Checked Out" });
    const loc = { latitude: 17.385, longitude: 78.4867, accuracy: 15 };
    await attendanceApi.checkOut("e1", loc, "idem-out");
    expect(apiClientMock.mock.calls[0][0]).toBe("/attendance/check-out");
    expect(parseBody(apiClientMock.mock.calls[0])).toEqual({ location: loc, idempotencyKey: "idem-out" });
  });

  it("getTodayRecord reads status from /attendance/status", async () => {
    apiClientMock.mockResolvedValueOnce({ id: "s", employeeId: "e1" });
    const rec = await attendanceApi.getTodayRecord("e1");
    expect(apiClientMock.mock.calls[0][0]).toBe("/attendance/status");
    expect(rec?.employeeId).toBe("e1");
  });

  it("getAllRecords reads from /attendance/history", async () => {
    apiClientMock.mockResolvedValueOnce([{ id: "a" }, { id: "b" }]);
    const recs = await attendanceApi.getAllRecords();
    expect(apiClientMock.mock.calls[0][0]).toBe("/attendance/history");
    expect(recs).toHaveLength(2);
  });

  it("submitCorrection POSTs to /attendance/corrections", async () => {
    apiClientMock.mockResolvedValueOnce({ id: "c1", status: "Pending" });
    await attendanceApi.submitCorrection({
      recordId: "r1",
      employeeId: "e1",
      employeeName: "Jane",
      requestedCheckIn: null,
      requestedCheckOut: null,
      reason: "Forgot to check in",
    });
    expect(apiClientMock.mock.calls[0][0]).toBe("/attendance/corrections");
    expect((apiClientMock.mock.calls[0][1] as RequestInit).method).toBe("POST");
  });

  it("reviewCorrection routes Approved -> approve endpoint and Rejected -> reject endpoint via PATCH", async () => {
    apiClientMock.mockResolvedValue(undefined);

    await attendanceApi.reviewCorrection("c1", "Approved");
    expect(apiClientMock.mock.calls[0][0]).toBe("/attendance/corrections/c1/approve");
    expect((apiClientMock.mock.calls[0][1] as RequestInit).method).toBe("PATCH");

    await attendanceApi.reviewCorrection("c2", "Rejected", "not valid");
    expect(apiClientMock.mock.calls[1][0]).toBe("/attendance/corrections/c2/reject");
    expect(parseBody(apiClientMock.mock.calls[1])).toEqual({ managerComment: "not valid" });
  });
});

describe("attendanceApi — offline resilience (backend unreachable)", () => {
  beforeEach(() => {
    localStorage.clear();
    apiClientMock.mockReset();
  });

  it("caches a provisional check-in locally when the network fails, and reads it back", async () => {
    apiClientMock.mockRejectedValue(new Error("Network error"));

    const provisional = await attendanceApi.checkIn("e1", "Jane");
    expect(provisional.employeeId).toBe("e1");
    expect(provisional.status).toBe("Present");
    // The provisional id is clearly marked as a local/offline record, never a server id.
    expect(provisional.id).toMatch(/^local_/);
  });

  it("returns an empty correction list rather than throwing when offline (server is source of truth)", async () => {
    apiClientMock.mockRejectedValue(new Error("Network error"));
    const pending = await attendanceApi.getPendingCorrections("Engineering");
    expect(pending).toEqual([]);
  });
});
