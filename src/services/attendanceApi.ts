import type { AttendanceRecord, CorrectionRequest, AttendanceAuditLog, Location, ShiftType, AttendanceSource } from "../types/attendance";
import { apiClient } from "./apiClient";
import { mockUsers } from "./authApi";

const LOCAL_STORAGE_KEY = "attendance_local_state_v2";

const getLocalState = (): Record<string, AttendanceRecord> => {
  let state: Record<string, AttendanceRecord> = {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Object.keys(parsed).length > 0) {
        state = parsed;
      }
    }
  } catch {
    // Ignore parse error
  }
  // Seed mock history if empty
  if (Object.keys(state).length === 0) {
    const today = new Date();
    for (let i = 1; i <= 5; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      
      state[`5_${dateStr}`] = {
        id: `mock_rec_emp_${i}`,
        employeeId: "5",
        employeeName: "John Doe",
        date: dateStr,
        checkInTime: `${dateStr}T09:30:00Z`,
        checkOutTime: `${dateStr}T18:00:00Z`,
        status: "Present",
        workingHours: 8.5,
        workDurationMinutes: 510,
        shiftType: "Regular",
        location: { latitude: 12.9716, longitude: 77.5946, accuracy: 10 },
        checkOutLocation: { latitude: 12.9716, longitude: 77.5946, accuracy: 10 },
        department: "Engineering",
        source: "Web",
        workMode: "Office",
      };
    }
  }

  // Common logic: Reset/ensure attendance for today for ALL accounts (including future added ones)
  const todayStr = new Date().toISOString().split("T")[0];
  let stateModified = false;

  mockUsers.forEach(user => {
    const key = `${user.id}_${todayStr}`;
    if (!state[key]) {
      state[key] = {
        id: `local_rec_reset_${user.id}_${Date.now()}`,
        employeeId: user.id,
        employeeName: user.fullName || "Employee",
        date: todayStr,
        checkInTime: null,
        checkOutTime: null,
        status: "Not Checked In",
        workingHours: 0,
        workDurationMinutes: 0,
        department: user.department || "Unknown",
        workMode: user.workMode || "Office",
      };
      stateModified = true;
    }
  });

  if (stateModified || Object.keys(state).length <= mockUsers.length) {
    saveLocalState(state);
  }

  return state;
};
  


const saveLocalState = (state: Record<string, AttendanceRecord>) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be unavailable (private mode / quota); ignore cache write failures
  }
};

export const attendanceApi = {
  getTodayRecord: async (employeeId: string): Promise<AttendanceRecord | null> => {
    const todayStr = new Date().toISOString().split("T")[0];
    try {
      const record = await apiClient<AttendanceRecord | null>("/attendance/status");
      
      // If the backend returns a record, verify it belongs to today. 
      // Sometimes APIs return the "latest" record which might be from yesterday.
      if (record && record.date) {
        const recordDateStr = record.date.split("T")[0];
        if (recordDateStr !== todayStr) {
          return null;
        }
      }
      return record;
    } catch {
      const localState = getLocalState();
      return localState[`${employeeId}_${todayStr}`] || null;
    }
  },

  checkIn: async (
    employeeId: string,
    employeeName: string,
    location?: Location,
    source: AttendanceSource = "Web",
    shiftType: ShiftType = "Regular",
    idempotencyKey?: string,
    department: string = "Unknown",
    isWFH?: boolean
  ): Promise<AttendanceRecord> => {
    try {
      return await apiClient<AttendanceRecord>("/attendance/check-in", {
        method: "POST",
        body: JSON.stringify({ location, source, shiftType, idempotencyKey, isWFH }),
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
        workMode: isWFH ? "WFH" : "Office",
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

  checkOut: async (employeeId: string, location?: Location, idempotencyKey?: string): Promise<AttendanceRecord> => {
    try {
      return await apiClient<AttendanceRecord>("/attendance/check-out", {
        method: "POST",
        body: JSON.stringify({ location, idempotencyKey }),
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
    try {
      return await apiClient<AttendanceRecord[]>("/attendance/history");
    } catch {
      const localState = getLocalState();
      return Object.values(localState);
    }
  },

  getTeamRecords: async (_managerDepartment: string): Promise<AttendanceRecord[]> => {
    try {
      return await apiClient<AttendanceRecord[]>("/attendance/history");
    } catch {
      const localState = getLocalState();
      return Object.values(localState);
    }
  },

  getEmployeeRecords: async (_employeeId: string): Promise<AttendanceRecord[]> => {
    try {
      return await apiClient<AttendanceRecord[]>("/attendance/history");
    } catch {
      const localState = getLocalState();
      return Object.values(localState).filter((r) => r.employeeId === _employeeId);
    }
  },

  submitCorrection: async (req: Omit<CorrectionRequest, "id" | "status" | "submittedAt" | "department">): Promise<CorrectionRequest> => {
    try {
      return await apiClient<CorrectionRequest>("/attendance/corrections", {
        method: "POST",
        body: JSON.stringify(req),
      });
    } catch {
      const newCorrection: CorrectionRequest = {
        ...req,
        id: `corr_${Date.now()}`,
        status: "Pending",
        submittedAt: new Date().toISOString(),
        department: "Engineering",
      };
      return newCorrection;
    }
  },

  getPendingCorrections: async (_managerDepartment?: string): Promise<CorrectionRequest[]> => {
    try {
      return await apiClient<CorrectionRequest[]>("/attendance/corrections");
    } catch {
      return [];
    }
  },
  
  getMyCorrections: async (_employeeId: string): Promise<CorrectionRequest[]> => {
    try {
      return await apiClient<CorrectionRequest[]>("/attendance/corrections");
    } catch {
      return [];
    }
  },

  reviewCorrection: async (correctionId: string, status: "Approved" | "Rejected", managerComment?: string): Promise<void> => {
    try {
      const endpoint = status === "Approved" 
        ? `/attendance/corrections/${correctionId}/approve` 
        : `/attendance/corrections/${correctionId}/reject`;
      return await apiClient<void>(endpoint, {
        method: "PATCH",
        body: JSON.stringify({ managerComment }),
      });
    } catch {
      return;
    }
  },

  getAuditLogs: async (): Promise<AttendanceAuditLog[]> => {
    // Currently no endpoint for this, return empty array for now
    return [];
  },

  clearAllData: (): void => {
    // No-op for real backend
  }
};
