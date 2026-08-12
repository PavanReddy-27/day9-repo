import type { AttendanceRecord, CorrectionRequest, AttendanceAuditLog, Location, ShiftType, AttendanceSource } from "../types/attendance";
import { apiClient } from "./apiClient";

const LOCAL_STORAGE_KEY = "attendance_local_state_v1";

const getLocalState = (): Record<string, AttendanceRecord> => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveLocalState = (state: Record<string, AttendanceRecord>) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch {}
};

export const attendanceApi = {
  getTodayRecord: async (employeeId: string): Promise<AttendanceRecord | null> => {
    try {
      return await apiClient<AttendanceRecord | null>("/attendance/status");
    } catch {
      const today = new Date().toISOString().split("T")[0];
      const localState = getLocalState();
      return localState[`${employeeId}_${today}`] || null;
    }
  },

  checkIn: async (
    employeeId: string,
    employeeName: string,
    location?: Location,
    source: AttendanceSource = "Web",
    shiftType: ShiftType = "Regular",
    idempotencyKey?: string,
    department: string = "Unknown"
  ): Promise<AttendanceRecord> => {
    try {
      return await apiClient<AttendanceRecord>("/attendance/check-in", {
        method: "POST",
        body: JSON.stringify({ location, source, shiftType, idempotencyKey }),
      });
    } catch {
      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toISOString();
      const newRecord: AttendanceRecord = {
        id: `local_rec_${Date.now()}`,
        employeeId,
        employeeName: employeeName || "Employee",
        department,
        date: today,
        checkInTime: now,
        checkOutTime: null,
        status: "Present",
        workDurationMinutes: 0,
        workingHours: 0,
        breakDurationMinutes: 0,
        totalBreakDuration: 0,
        breakStartTime: null,
        shiftType,
        source,
        location,
      };

      const localState = getLocalState();
      localState[`${employeeId}_${today}`] = newRecord;
      saveLocalState(localState);
      return newRecord;
    }
  },

  startBreak: async (employeeId: string): Promise<AttendanceRecord> => {
    try {
      return await apiClient<AttendanceRecord>("/attendance/break", {
        method: "POST",
      });
    } catch {
      const today = new Date().toISOString().split("T")[0];
      const localState = getLocalState();
      const key = `${employeeId}_${today}`;
      const existing = localState[key];
      if (existing) {
        existing.status = "On Break";
        existing.breakStartTime = new Date().toISOString();
        localState[key] = existing;
        saveLocalState(localState);
        return existing;
      }
      throw new Error("No active check-in record found.");
    }
  },

  endBreak: async (employeeId: string): Promise<AttendanceRecord> => {
    try {
      return await apiClient<AttendanceRecord>("/attendance/resume", {
        method: "POST",
      });
    } catch {
      const today = new Date().toISOString().split("T")[0];
      const localState = getLocalState();
      const key = `${employeeId}_${today}`;
      const existing = localState[key];
      if (existing) {
        const breakStart = existing.breakStartTime ? new Date(existing.breakStartTime).getTime() : Date.now();
        const breakMins = Math.round((Date.now() - breakStart) / 60000);
        existing.totalBreakDuration = (existing.totalBreakDuration || 0) + breakMins;
        existing.breakDurationMinutes = existing.totalBreakDuration;
        existing.status = "Present";
        existing.breakStartTime = null;
        localState[key] = existing;
        saveLocalState(localState);
        return existing;
      }
      throw new Error("No active break record found.");
    }
  },

  checkOut: async (employeeId: string, location?: Location): Promise<AttendanceRecord> => {
    try {
      return await apiClient<AttendanceRecord>("/attendance/check-out", {
        method: "POST",
        body: JSON.stringify({ location }),
      });
    } catch {
      const today = new Date().toISOString().split("T")[0];
      const localState = getLocalState();
      const key = `${employeeId}_${today}`;
      const existing = localState[key];
      if (existing) {
        const checkInTimeMs = existing.checkInTime ? new Date(existing.checkInTime).getTime() : Date.now();
        const totalElapsedMins = Math.round((Date.now() - checkInTimeMs) / 60000);
        const netMins = Math.max(0, totalElapsedMins - (existing.totalBreakDuration || 0));
        existing.checkOutTime = new Date().toISOString();
        existing.checkOutLocation = location;
        existing.status = "Checked Out";
        existing.workDurationMinutes = netMins;
        existing.workingHours = Number((netMins / 60).toFixed(2));
        existing.breakStartTime = null;
        localState[key] = existing;
        saveLocalState(localState);
        return existing;
      }
      throw new Error("No active check-in record found.");
    }
  },

  getAllRecords: async (): Promise<AttendanceRecord[]> => {
    return apiClient<AttendanceRecord[]>("/attendance/history");
  },

  getTeamRecords: async (_managerDepartment: string): Promise<AttendanceRecord[]> => {
    return apiClient<AttendanceRecord[]>("/attendance/history");
  },

  getEmployeeRecords: async (_employeeId: string): Promise<AttendanceRecord[]> => {
    return apiClient<AttendanceRecord[]>("/attendance/history");
  },

  submitCorrection: async (req: Omit<CorrectionRequest, "id" | "status" | "submittedAt" | "department">): Promise<CorrectionRequest> => {
    return apiClient<CorrectionRequest>("/attendance/corrections", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  getPendingCorrections: async (_managerDepartment?: string): Promise<CorrectionRequest[]> => {
    return apiClient<CorrectionRequest[]>("/attendance/corrections");
  },
  
  getMyCorrections: async (_employeeId: string): Promise<CorrectionRequest[]> => {
    return apiClient<CorrectionRequest[]>("/attendance/corrections");
  },

  reviewCorrection: async (correctionId: string, status: "Approved" | "Rejected", managerComment?: string): Promise<void> => {
    const endpoint = status === "Approved" 
      ? `/attendance/corrections/${correctionId}/approve` 
      : `/attendance/corrections/${correctionId}/reject`;
    return apiClient<void>(endpoint, {
      method: "PATCH",
      body: JSON.stringify({ managerComment }),
    });
  },

  getAuditLogs: async (): Promise<AttendanceAuditLog[]> => {
    // Currently no endpoint for this, return empty array for now
    return [];
  },

  clearAllData: (): void => {
    // No-op for real backend
  }
};
