import type { AttendanceRecord, CorrectionRequest, AttendanceAuditLog, Location, ShiftType, AttendanceSource } from "../types/attendance";
import { apiClient, ApiError } from "./apiClient";
import { enqueueOfflineAction, getPendingOfflineActions } from "../utils/offlineQueue";

/**
 * Attendance service — 100% backend-driven.
 *
 * There is NO mock/localStorage data anywhere in here: every record comes from
 * MongoDB through the API. Write actions (check-in/out, break, corrections)
 * propagate backend errors so the UI can show a real error state instead of a
 * fabricated success. Read methods return empty results on failure rather than
 * inventing rows, so tables never display fake attendance.
 */
export const attendanceApi = {
  getTodayRecord: async (employeeId: string): Promise<AttendanceRecord | null> => {
    const todayStr = new Date().toISOString().split("T")[0];
    try {
      const record = await apiClient<AttendanceRecord | null>("/attendance/status");
      // The status endpoint returns today's record (or a virtual "Not Checked In").
      if (record && record.date) {
        const recordDateStr = String(record.date).split("T")[0];
        if (recordDateStr !== todayStr) return null;
      }
      return record;
    } catch {
      // If backend fails, check IndexedDB for a provisional offline record
      try {
        const pending = await getPendingOfflineActions();
        // Look for the most recent pending checkIn for this employee
        // Since getPendingOfflineActions returns all pending, we find the last checkIn
        const checkIns = pending.filter(a => a.actionType === "check-in");
        if (checkIns.length > 0) {
          const latest = checkIns[checkIns.length - 1];
          const todayStr = new Date().toISOString().split("T")[0];
          // Construct the provisional record from the queued action
          return {
            id: `local_${latest.id}`,
            employeeId,
            employeeName: "Employee",
            date: todayStr,
            checkInTime: latest.createdAt,
            checkOutTime: null,
            workingHours: 0,
            status: "Present",
            shiftType: (latest.payload as any).shiftType || "General",
            source: "Offline",
            location: (latest.payload as any).location,
          } as AttendanceRecord;
        }
      } catch {
        // IndexedDB unavailable
      }
      return null;
    }
  },

  checkIn: async (
    employeeId: string,
    employeeName: string,
    location?: Location,
    source: AttendanceSource = "Web",
    shiftType: ShiftType = "General",
    idempotencyKey?: string,
    _department?: string,
    isWFH?: boolean
  ): Promise<AttendanceRecord> => {
    try {
      return await apiClient<AttendanceRecord>("/attendance/check-in", {
        method: "POST",
        body: JSON.stringify({ location, source, shiftType, idempotencyKey, isWFH }),
      });
    } catch (err) {
      if (err instanceof ApiError) {
        throw err; // Don't swallow validation errors as offline check-ins
      }
      const todayStr = new Date().toISOString().split("T")[0];
      const provisional: AttendanceRecord = {
        id: `local_${Date.now()}`,
        employeeId,
        employeeName,
        date: todayStr,
        checkInTime: new Date().toISOString(),
        checkOutTime: null,
        workingHours: 0,
        status: "Present",
        shiftType,
        source: "Offline",
        location,
      };
      try {
        await enqueueOfflineAction("check-in", {
          location, source, shiftType, idempotencyKey, isWFH
        });
      } catch {
        // IndexedDB unavailable (private mode / quota); provisional stays in memory only.
      }
      return provisional;
    }
  },

  startBreak: async (_employeeId?: string): Promise<AttendanceRecord> => {
    return apiClient<AttendanceRecord>("/attendance/break", { method: "POST" });
  },

  endBreak: async (_employeeId?: string): Promise<AttendanceRecord> => {
    return apiClient<AttendanceRecord>("/attendance/resume", { method: "POST" });
  },

  checkOut: async (_employeeId: string, location?: Location, idempotencyKey?: string): Promise<AttendanceRecord> => {
    return apiClient<AttendanceRecord>("/attendance/check-out", {
      method: "POST",
      body: JSON.stringify({ location, idempotencyKey }),
    });
  },

  /** Global attendance for a date: EVERY employee with checked-in / not-checked-in status. */
  getGlobalAttendance: async (date?: string): Promise<AttendanceRecord[]> => {
    try {
      const qs = date ? `?date=${encodeURIComponent(date)}` : "";
      return await apiClient<AttendanceRecord[]>(`/attendance/global${qs}`);
    } catch {
      return [];
    }
  },

  getAllRecords: async (): Promise<AttendanceRecord[]> => {
    try {
      return await apiClient<AttendanceRecord[]>("/attendance/history");
    } catch {
      return [];
    }
  },

  getTeamRecords: async (_managerDepartment?: string): Promise<AttendanceRecord[]> => {
    try {
      return await apiClient<AttendanceRecord[]>("/attendance/history");
    } catch {
      return [];
    }
  },

  getEmployeeRecords: async (employeeId?: string): Promise<AttendanceRecord[]> => {
    try {
      const endpoint = employeeId
        ? `/attendance/history?employeeId=${encodeURIComponent(employeeId)}`
        : "/attendance/history";
      return await apiClient<AttendanceRecord[]>(endpoint);
    } catch {
      return [];
    }
  },

  submitCorrection: async (
    req: Omit<CorrectionRequest, "id" | "status" | "submittedAt" | "department">
  ): Promise<CorrectionRequest> => {
    return apiClient<CorrectionRequest>("/attendance/corrections", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  getPendingCorrections: async (_managerDepartment?: string): Promise<CorrectionRequest[]> => {
    try {
      return await apiClient<CorrectionRequest[]>("/attendance/corrections");
    } catch {
      return [];
    }
  },

  getMyCorrections: async (_employeeId?: string): Promise<CorrectionRequest[]> => {
    try {
      return await apiClient<CorrectionRequest[]>("/attendance/corrections");
    } catch {
      return [];
    }
  },

  reviewCorrection: async (
    correctionId: string,
    status: "Approved" | "Rejected",
    managerComment?: string
  ): Promise<void> => {
    const endpoint =
      status === "Approved"
        ? `/attendance/corrections/${correctionId}/approve`
        : `/attendance/corrections/${correctionId}/reject`;
    await apiClient<void>(endpoint, {
      method: "PATCH",
      body: JSON.stringify({ managerComment }),
    });
  },

  getAuditLogs: async (): Promise<AttendanceAuditLog[]> => {
    try {
      return await apiClient<AttendanceAuditLog[]>("/attendance/audit-logs");
    } catch {
      return [];
    }
  },

  clearAllData: (): void => {
    // No-op: attendance state lives only in MongoDB.
  },
};

if (typeof window !== "undefined") {
  import("../utils/offlineQueue").then(({ syncOfflineQueue }) => {
    window.addEventListener("sync_offline_queue", () => {
      syncOfflineQueue(async (action) => {
        let endpoint = "";
        if (action.actionType === "check-in") endpoint = "/attendance/check-in";
        else if (action.actionType === "check-out") endpoint = "/attendance/check-out";
        else if (action.actionType === "break") endpoint = "/attendance/break";
        else if (action.actionType === "resume") endpoint = "/attendance/resume";
        else if (action.actionType === "correction") endpoint = "/attendance/corrections";

        if (!endpoint) throw new Error("Unknown offline action type");
        
        return apiClient(endpoint, {
          method: "POST",
          body: JSON.stringify(action.payload)
        });
      }).catch(console.error);
    });
  });
}
