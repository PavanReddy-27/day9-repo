export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export type ShiftType = "Regular" | "Flexible" | "Night" | "CrossMidnight";
export type AttendanceSource = "Web" | "Mobile" | "Offline";
export type AttendancePolicyType = "Office" | "Remote" | "Hybrid";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  workingHours: number;
  workDurationMinutes?: number;
  breakDurationMinutes?: number;
  status: "Present" | "Half-Day" | "Late" | "Absent" | "Leave" | "Suspicious" | "Working" | "On Break" | "Checked Out" | "Not Checked In";

  shiftType?: ShiftType;
  policyType?: AttendancePolicyType;
  location?: Location;
  checkOutLocation?: Location;
  source?: AttendanceSource;
  breakStartTime?: string | null;
  totalBreakDuration?: number; // in minutes
  isOvertime?: boolean;
  lateArrival?: boolean;
  earlyDeparture?: boolean;
  isOvernight?: boolean;
  idempotencyKey?: string;
  department?: string;
  suspiciousReason?: string;
  lastUpdatedAt?: string;
  workMode?: string;
}

export interface CorrectionRequest {
  id: string;
  recordId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  requestedCheckIn: string | null;
  requestedCheckOut: string | null;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  managerComment?: string;
  submittedAt: string;
}

export interface AttendanceAuditLog {
  id: string;
  recordId: string;
  action: "CheckIn" | "BreakStart" | "BreakEnd" | "CheckOut" | "CorrectionApproved" | "CorrectionRejected" | "SuspiciousActivity";
  timestamp: string;
  performedBy: string;
  details: string;
}
