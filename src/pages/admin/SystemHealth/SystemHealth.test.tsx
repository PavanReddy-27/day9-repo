// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import SystemHealth from "./SystemHealth";
import * as apiClientModule from "../../../services/apiClient";
import * as offlineQueueModule from "../../../utils/offlineQueue";

describe("Admin SystemHealth Monitoring Dashboard (Task 16 - Pavan Kumar)", () => {
  const mockMetrics = {
    timestamp: new Date().toISOString(),
    server: {
      uptimeSeconds: 3600,
      nodeVersion: "v24.19.0",
      platform: "win32",
      cpuCount: 8,
      loadAverage: [0.5, 0.4, 0.3],
      freeMemoryMB: 4096,
      totalMemoryMB: 16384,
    },
    memory: {
      heapUsedMB: 64,
      heapTotalMB: 128,
      rssMB: 180,
      externalMB: 10,
    },
    database: {
      status: "connected",
      state: "Online",
      connected: true,
      readyState: 1,
      host: "127.0.0.1",
      name: "workforce_analytics",
      pingMs: 2,
      collectionsCount: 25,
      documentCounts: {
        users: 250,
        employees: 250,
        attendancerecords: 5500,
      },
    },
    traffic: {
      totalRequests: 1420,
      status2xx: 1400,
      status4xx: 18,
      status5xx: 2,
      p95LatencyMs: 45,
      avgLatencyMs: 18,
      availabilityPct: 99.8,
    },
    monitoring: {
      activeSessions: 12,
      connectedClients: 5,
      failedLogins: 1,
      lockedAccounts: 0,
      offlineSyncFailures: 0,
      notificationFailures: 0,
    },
  };

  const mockJobStats = {
    total: 100,
    completed: 98,
    failed: 2,
    deadLetterCount: 0,
    active: 0,
    waiting: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(apiClientModule, "apiClient").mockImplementation(async (endpoint: string) => {
      if (endpoint === "/system/metrics") {
        return mockMetrics as any;
      }
      if (endpoint === "/jobs/stats") {
        return mockJobStats as any;
      }
      if (endpoint === "/jobs/dead-letter") {
        return [] as any;
      }
      return {} as any;
    });

    vi.spyOn(offlineQueueModule, "getOfflineQueueStats").mockResolvedValue({
      pending: 0,
      failed: 0,
      conflict: 0,
      synced: 0,
      total: 0,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the 6 core monitored telemetry areas with live stats", async () => {
    render(<SystemHealth />);

    await waitFor(() => {
      expect(screen.getByText(/System Health & Operations/i)).toBeInTheDocument();
    });

    // 1. API Availability & Latency Card
    expect(screen.getByText(/API Availability & Response Time/i)).toBeInTheDocument();
    expect(screen.getByText("99.8%")).toBeInTheDocument();

    // 2. Active Sessions & Notification Clients
    expect(screen.getByText(/Active Sessions & Notification Clients/i)).toBeInTheDocument();
    expect(screen.getByText(/12 Active Sessions/i)).toBeInTheDocument();

    // 3. Failed Logins & Locked Accounts
    expect(screen.getByText(/Failed Logins & Locked Accounts/i)).toBeInTheDocument();
    expect(screen.getByText(/1 Failed Logins/i)).toBeInTheDocument();

    // 4. Offline Attendance Queue Failures
    expect(screen.getByText(/Offline Attendance Queue Failures/i)).toBeInTheDocument();
    expect(screen.getAllByText(/0 Failures/i).length).toBeGreaterThanOrEqual(1);

    // 5. Notification Delivery Failures
    expect(screen.getByText(/Notification Delivery Failures/i)).toBeInTheDocument();

    // 6. MongoDB Connectivity & Background Jobs
    expect(screen.getByText(/MongoDB Connectivity & Background Jobs/i)).toBeInTheDocument();
  });

  it("supports switching tabs for deep operational insights", async () => {
    render(<SystemHealth />);

    await waitFor(() => {
      expect(screen.getByText(/System Health & Operations/i)).toBeInTheDocument();
    });

    // Click Dead-Letter Queue Tab
    const dlqTabs = screen.getAllByRole("tab", { name: /Dead-Letter Queue/i });
    fireEvent.click(dlqTabs[0]);

    await waitFor(() => {
      expect(screen.getByText(/Dead-Letter Queue \(DLQ\)/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/No dead-letter items/i)).toBeInTheDocument();

    // Click Security Tab
    const securityTab = screen.getByRole("tab", { name: /Security & Failed Logins/i });
    fireEvent.click(securityTab);

    await waitFor(() => {
      expect(screen.getAllByText(/Locked Accounts/i).length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByText(/Recent Failed Login Attempts/i)).toBeInTheDocument();
  });

  it("provides accessible WCAG 2.1 AA attributes and controls", async () => {
    render(<SystemHealth />);

    await waitFor(() => {
      expect(screen.getByText(/System Health & Operations/i)).toBeInTheDocument();
    });

    // Tablist role
    const tablist = screen.getByRole("tablist");
    expect(tablist).toBeInTheDocument();

    // Refresh button has accessible label
    const refreshBtn = screen.getByRole("button", { name: /Refresh telemetry data/i });
    expect(refreshBtn).toBeInTheDocument();
  });
});
