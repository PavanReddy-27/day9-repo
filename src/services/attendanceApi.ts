import type { AttendanceRecord, CorrectionRequest, AttendanceAuditLog, Location, ShiftType, AttendanceSource } from "../types/attendance";
import { apiClient } from "./apiClient";

export const attendanceApi = {
  getTodayRecord: async (_employeeId: string): Promise<AttendanceRecord | null> => {
    return apiClient<AttendanceRecord | null>("/attendance/status");
  },

  checkIn: async (
    _employeeId: string,
    _employeeName: string,
    location?: Location,
    source: AttendanceSource = "Web",
    shiftType: ShiftType = "Regular",
    idempotencyKey?: string,
    _department: string = "Unknown"
  ): Promise<AttendanceRecord> => {
    return apiClient<AttendanceRecord>("/attendance/check-in", {
      method: "POST",
      body: JSON.stringify({ location, source, shiftType, idempotencyKey }),
    });
  },

  startBreak: async (_employeeId: string): Promise<AttendanceRecord> => {
    return apiClient<AttendanceRecord>("/attendance/break", {
      method: "POST",
    });
  },

  endBreak: async (_employeeId: string): Promise<AttendanceRecord> => {
    return apiClient<AttendanceRecord>("/attendance/resume", {
      method: "POST",
    });
  },

  checkOut: async (_employeeId: string, location?: Location): Promise<AttendanceRecord> => {
    return apiClient<AttendanceRecord>("/attendance/check-out", {
      method: "POST",
      body: JSON.stringify({ location }),
    });
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
