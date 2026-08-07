import type { AttendanceRecord, CorrectionRequest, AttendanceAuditLog, Location, ShiftType, AttendanceSource, AttendancePolicyType } from "../types/attendance";
import authApi from "./authApi";
import { simulateBackendChecks, BackendSimulationError } from "./backendSimulation";
import { getDistanceMeters, getOfficeLocation, GEOFENCE_RADIUS_METERS, MAX_GPS_ACCURACY_METERS } from "../config/attendance";

const STORAGE_KEY = "workforce_attendance";
const CORRECTIONS_KEY = "workforce_corrections";
const AUDIT_KEY = "workforce_attendance_audit";
const SERVER_TIME_OFFSET_KEY = "workforce_server_time_offset_ms";

const getStoredRecords = (): AttendanceRecord[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveRecords = (records: AttendanceRecord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event("attendance_updated"));
};

const getStoredCorrections = (): CorrectionRequest[] => {
  const data = localStorage.getItem(CORRECTIONS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveCorrections = (corrections: CorrectionRequest[]) => {
  localStorage.setItem(CORRECTIONS_KEY, JSON.stringify(corrections));
  window.dispatchEvent(new Event("corrections_updated"));
};

const getStoredAudit = (): AttendanceAuditLog[] => {
  const data = localStorage.getItem(AUDIT_KEY);
  return data ? JSON.parse(data) : [];
};

const logAudit = (recordId: string, action: AttendanceAuditLog["action"], details: string) => {
  const user = authApi.getCurrentUser();
  const logs = getStoredAudit();
  logs.push({
    id: Math.random().toString(36).substr(2, 9),
    recordId,
    action,
    timestamp: getServerTime(),
    performedBy: user?.id || "System",
    details,
  });
  localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
};

const getServerTimeOffsetMs = () => {
  const stored = Number(localStorage.getItem(SERVER_TIME_OFFSET_KEY) || 0);
  return Number.isFinite(stored) ? stored : 0;
};

const getServerTime = () => new Date(Date.now() + getServerTimeOffsetMs()).toISOString();

const emitAttendanceEvent = (eventName: string, detail?: Record<string, unknown>) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(eventName, { detail }));

  try {
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("workforce_attendance");
      channel.postMessage({ eventName, detail });
      channel.close();
    }
  } catch {
    // BroadcastChannel is optional and may be unavailable in some contexts.
  }

  try {
    localStorage.setItem("workforce_attendance_live", JSON.stringify({ eventName, detail, timestamp: getServerTime() }));
  } catch {
    // Ignore storage quota issues.
  }
};

// An explicit workMode on the user's profile always wins (it's what a WFH/hybrid
// employee is actually configured as); falling back to a department-name heuristic
// keeps existing department-only data (and department can't double as a location
// signal for team/manager scoping, so this is only ever a fallback).
export const getAttendancePolicy = (department: string | undefined, workMode?: AttendancePolicyType): AttendancePolicyType => {
  if (workMode) return workMode;

  const normalized = department?.toLowerCase() || "";
  if (normalized.includes("remote")) return "Remote";
  if (normalized.includes("hybrid")) return "Hybrid";
  return "Office";
};

const getShiftKind = (shiftType: ShiftType, checkInTime: string) => {
  const hour = new Date(checkInTime).getHours();
  if (shiftType === "Night") return "Night";
  if (shiftType === "CrossMidnight") return "CrossMidnight";
  if (shiftType === "Flexible") return "Flexible";
  return hour >= 21 ? "Night" : "Regular";
};

const getCurrentAttendanceActor = () => {
  const user = authApi.getCurrentUser();
  return {
    user,
    role: user?.role ?? "Employee",
    department: user?.department ?? "Unknown",
  };
};

const assertAttendanceAccess = (resource: string, action: string, targetDepartment?: string) => {
  const actor = getCurrentAttendanceActor();
  if (!actor.user) {
    throw new BackendSimulationError("Invalid session", 401);
  }

  simulateBackendChecks(resource, action, targetDepartment ?? actor.department);
};

// Employees may only act on / view their own attendance records.
const assertSelfAccess = (actor: ReturnType<typeof getCurrentAttendanceActor>, employeeId: string) => {
  if (!actor.user) {
    throw new BackendSimulationError("Your session has expired. Please log in again.", 401);
  }
  if (actor.role === "Employee" && employeeId !== actor.user.id) {
    throw new BackendSimulationError("Access denied: employees may only access their own attendance.", 403);
  }
};

// Lets callers distinguish "GPS too imprecise to trust" from "confirmed outside
// the office radius" programmatically (e.g. to render different UI/icons)
// instead of pattern-matching on the error message.
export class GeofenceError extends Error {
  constructor(message: string, public readonly reason: "inaccurate_gps" | "outside_geofence") {
    super(message);
    this.name = "GeofenceError";
  }
}

const assertGeofenceAndAccuracy = (location: Location | undefined, policyType: AttendancePolicyType, action: "Check-in" | "Check-out" = "Check-in") => {
  if (!location) return;

  if (location.accuracy > MAX_GPS_ACCURACY_METERS) {
    throw new GeofenceError(
      `GPS reading is too inaccurate (±${Math.round(location.accuracy)}m) to verify your location. Please try again with a stronger signal.`,
      "inaccurate_gps"
    );
  }

  if (policyType === "Office") {
    const officeLocation = getOfficeLocation();
    const distance = getDistanceMeters(location, officeLocation);
    if (distance > GEOFENCE_RADIUS_METERS) {
      throw new GeofenceError(
        `${action} blocked: you are ${Math.round(distance)}m away from ${officeLocation.name}, outside the ${GEOFENCE_RADIUS_METERS}m allowed range.`,
        "outside_geofence"
      );
    }
  }
};

const evaluateAttendanceFlags = (record: AttendanceRecord) => {
  const checkIn = record.checkInTime ? new Date(record.checkInTime) : null;
  const checkOut = record.checkOutTime ? new Date(record.checkOutTime) : null;

  if (!checkIn || !checkOut) return record;

  const grossMinutes = (checkOut.getTime() - checkIn.getTime()) / 60000;
  const netMinutes = grossMinutes - (record.totalBreakDuration || 0);
  const hours = Number((netMinutes / 60).toFixed(2));
  record.workingHours = hours;

  const isOvernight = checkIn.getDate() !== checkOut.getDate() || checkOut.getHours() < checkIn.getHours();
  record.isOvernight = isOvernight;

  if (record.shiftType === "Night" || record.shiftType === "CrossMidnight") {
    record.isOvertime = hours > 8;
  } else if (hours > 9) {
    record.isOvertime = true;
  }

  const isLate = record.shiftType === "Regular" && checkIn.getHours() >= 9 && checkIn.getMinutes() > 15;
  record.lateArrival = isLate;

  if (hours < 8 && record.shiftType === "Regular") {
    record.earlyDeparture = true;
  }

  const suspiciousThreshold = record.shiftType === "Night" ? 14 : 18;
  if (hours > suspiciousThreshold) {
    record.status = "Suspicious";
    record.suspiciousReason = `Impossible working hours detected: ${hours}h`;
  } else {
    record.status = hours > 9 ? "Present" : record.lateArrival ? "Late" : "Present";
  }

  return record;
};

export const attendanceApi = {
  getTodayRecord: async (employeeId: string): Promise<AttendanceRecord | null> => {
    const actor = getCurrentAttendanceActor();
    assertAttendanceAccess("attendance", "read", actor.department);
    assertSelfAccess(actor, employeeId);

    const records = getStoredRecords();
    const today = getServerTime().split("T")[0];

    const openRecord = records.find(r => r.employeeId === employeeId && !r.checkOutTime);
    if (openRecord) return openRecord;

    return records.find(r => r.employeeId === employeeId && r.date === today) || null;
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
    const actor = getCurrentAttendanceActor();
    assertSelfAccess(actor, employeeId);
    const records = getStoredRecords();

    if (idempotencyKey) {
      const existing = records.find(r => r.idempotencyKey === idempotencyKey);
      if (existing) return existing;
    }

    const openRecord = records.find(r => r.employeeId === employeeId && !r.checkOutTime);
    if (openRecord) {
      throw new Error("Already checked in or active session exists.");
    }

    assertAttendanceAccess("attendance", "create", department);

    const policyType = getAttendancePolicy(department, actor.user?.workMode);
    assertGeofenceAndAccuracy(location, policyType);

    const today = getServerTime().split("T")[0];
    const checkInTime = getServerTime();
    const normalizedShiftType = getShiftKind(shiftType, checkInTime);

    const newRecord: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId,
      employeeName,
      department,
      date: today,
      checkInTime,
      checkOutTime: null,
      workingHours: 0,
      status: "Present",
      shiftType: normalizedShiftType as ShiftType,
      policyType,
      location,
      source,
      breakStartTime: null,
      totalBreakDuration: 0,
      isOvertime: false,
      lateArrival: false,
      earlyDeparture: false,
      idempotencyKey,
      lastUpdatedAt: getServerTime(),
    };

    if (actor.role !== "Employee") {
      newRecord.status = "Present";
    }

    const checkInHour = new Date(checkInTime).getHours();
    const isLate = normalizedShiftType === "Regular" && checkInHour >= 9 && new Date(checkInTime).getMinutes() > 15;
    newRecord.lateArrival = isLate;
    if (isLate) {
      newRecord.status = "Late";
    }

    records.push(newRecord);
    saveRecords(records);
    logAudit(newRecord.id, "CheckIn", `Checked in at ${checkInTime} via ${source}`);

    if (isLate) {
      emitAttendanceEvent("attendance_late", { message: "Late check-in recorded.", severity: "warning" });
    }

    emitAttendanceEvent("attendance_updated", { message: "Attendance updated.", severity: "success" });

    return newRecord;
  },

  startBreak: async (employeeId: string): Promise<AttendanceRecord> => {
    assertSelfAccess(getCurrentAttendanceActor(), employeeId);
    const records = getStoredRecords();
    const record = records.find(r => r.employeeId === employeeId && !r.checkOutTime);
    if (!record) throw new Error("No active check-in found.");
    if (record.breakStartTime) throw new Error("Already on break.");

    record.breakStartTime = getServerTime();
    record.lastUpdatedAt = getServerTime();
    saveRecords(records);
    logAudit(record.id, "BreakStart", `Started break at ${record.breakStartTime}`);
    emitAttendanceEvent("attendance_updated", { message: "Break started.", severity: "info" });
    return record;
  },

  endBreak: async (employeeId: string): Promise<AttendanceRecord> => {
    assertSelfAccess(getCurrentAttendanceActor(), employeeId);
    const records = getStoredRecords();
    const record = records.find(r => r.employeeId === employeeId && !r.checkOutTime);
    if (!record) throw new Error("No active check-in found.");
    if (!record.breakStartTime) throw new Error("Not currently on break.");

    const start = new Date(record.breakStartTime).getTime();
    const end = new Date(getServerTime()).getTime();
    const breakMins = Math.floor((end - start) / 60000);

    record.totalBreakDuration = (record.totalBreakDuration || 0) + breakMins;
    record.breakStartTime = null;
    record.lastUpdatedAt = getServerTime();

    saveRecords(records);
    logAudit(record.id, "BreakEnd", `Ended break. Duration: ${breakMins} mins.`);
    emitAttendanceEvent("attendance_updated", { message: "Break ended.", severity: "info" });
    return record;
  },

  checkOut: async (employeeId: string, location?: Location): Promise<AttendanceRecord> => {
    assertSelfAccess(getCurrentAttendanceActor(), employeeId);
    const records = getStoredRecords();

    const index = records.findIndex(r => r.employeeId === employeeId && !r.checkOutTime);
    if (index === -1) {
      throw new Error("No active check-in found to check out.");
    }

    const record = records[index];

    try {
      assertAttendanceAccess("attendance", "update", record.department);
    } catch (error) {
      if (error instanceof BackendSimulationError) {
        throw error;
      }
    }

    // Reuse the policy resolved at check-in time (stored on the record) rather than
    // re-deriving it, so check-out is always consistent with how the session started.
    assertGeofenceAndAccuracy(location, record.policyType ?? getAttendancePolicy(record.department), "Check-out");

    if (record.breakStartTime) {
      const bStart = new Date(record.breakStartTime).getTime();
      const bEnd = new Date(getServerTime()).getTime();
      record.totalBreakDuration = (record.totalBreakDuration || 0) + Math.floor((bEnd - bStart) / 60000);
      record.breakStartTime = null;
    }

    record.checkOutTime = getServerTime();
    record.checkOutLocation = location;
    record.lastUpdatedAt = getServerTime();

    evaluateAttendanceFlags(record);

    if (record.status === "Suspicious") {
      logAudit(record.id, "SuspiciousActivity", record.suspiciousReason || "Suspicious attendance detected");
      emitAttendanceEvent("attendance_suspicious", { message: `Suspicious activity: ${record.suspiciousReason}` , severity: "error" });
    } else if (record.isOvertime) {
      emitAttendanceEvent("attendance_overtime", { message: "Overtime shift completed.", severity: "info" });
    }

    saveRecords(records);
    logAudit(record.id, "CheckOut", `Checked out at ${record.checkOutTime}. Worked ${record.workingHours}h`);
    emitAttendanceEvent("attendance_updated", { message: "Attendance checked out.", severity: "success" });
    return record;
  },

  getAllRecords: async (): Promise<AttendanceRecord[]> => {
    const actor = getCurrentAttendanceActor();
    assertAttendanceAccess("attendance", "read", actor.department);
    const records = getStoredRecords();

    if (actor.role === "Employee") {
      return records.filter(r => r.employeeId === actor.user?.id);
    }

    if (actor.role === "Manager") {
      return records.filter(r => r.department === actor.department);
    }

    return records;
  },

  getTeamRecords: async (managerDepartment: string): Promise<AttendanceRecord[]> => {
    const actor = getCurrentAttendanceActor();
    assertAttendanceAccess("attendance", "read", managerDepartment);
    const records = getStoredRecords();

    if (actor.role === "Employee") {
      return records.filter(r => r.employeeId === actor.user?.id);
    }

    if (actor.role === "Manager") {
      return records.filter(r => r.department === managerDepartment && r.department === actor.department);
    }

    return records.filter(r => r.department === managerDepartment);
  },

  getEmployeeRecords: async (employeeId: string): Promise<AttendanceRecord[]> => {
    const actor = getCurrentAttendanceActor();
    assertAttendanceAccess("attendance", "read", actor.department);
    const records = getStoredRecords();

    if (actor.role === "Employee") {
      return records.filter(r => r.employeeId === employeeId && r.employeeId === actor.user?.id);
    }

    if (actor.role === "Manager") {
      return records.filter(r => r.employeeId === employeeId && r.department === actor.department);
    }

    return records.filter(r => r.employeeId === employeeId);
  },

  // Corrections
  submitCorrection: async (req: Omit<CorrectionRequest, "id" | "status" | "submittedAt" | "department">): Promise<CorrectionRequest> => {
    const actor = getCurrentAttendanceActor();
    assertAttendanceAccess("attendance_corrections", "create");
    assertSelfAccess(actor, req.employeeId);
    const corrections = getStoredCorrections();
    const newCorrection: CorrectionRequest = {
      ...req,
      id: Math.random().toString(36).substr(2, 9),
      department: actor.department,
      status: "Pending",
      submittedAt: getServerTime(),
    };
    corrections.push(newCorrection);
    saveCorrections(corrections);
    emitAttendanceEvent("corrections_updated", { message: "Correction request submitted.", severity: "info" });
    return newCorrection;
  },

  getPendingCorrections: async (managerDepartment?: string): Promise<CorrectionRequest[]> => {
    const actor = getCurrentAttendanceActor();
    const targetDepartment = managerDepartment ?? actor.department;
    assertAttendanceAccess("attendance_corrections", "read", targetDepartment);
    const corrections = getStoredCorrections().filter(c => c.status === "Pending");

    if (actor.role === "Manager") {
      return corrections.filter(c => c.department === actor.department);
    }

    return corrections;
  },
  
  getMyCorrections: async (employeeId: string): Promise<CorrectionRequest[]> => {
    const actor = getCurrentAttendanceActor();
    assertAttendanceAccess("attendance_corrections", "read", actor.department);
    const corrections = getStoredCorrections().filter(c => c.employeeId === employeeId);

    if (actor.role === "Employee") {
      return corrections.filter(c => c.employeeId === actor.user?.id);
    }

    return corrections;
  },

  reviewCorrection: async (correctionId: string, status: "Approved" | "Rejected", managerComment?: string): Promise<void> => {
    const corrections = getStoredCorrections();
    const cIdx = corrections.findIndex(c => c.id === correctionId);
    if (cIdx === -1) throw new Error("Correction not found");

    // Scope the department check to the correction's own department, not the
    // reviewer's, so a Manager cannot approve/reject requests from other teams.
    assertAttendanceAccess("attendance_corrections", "review", corrections[cIdx].department);

    corrections[cIdx].status = status;
    corrections[cIdx].managerComment = managerComment;

    if (status === "Approved") {
      const records = getStoredRecords();
      const rIdx = records.findIndex(r => r.id === corrections[cIdx].recordId);
      if (rIdx !== -1) {
        if (corrections[cIdx].requestedCheckIn) records[rIdx].checkInTime = corrections[cIdx].requestedCheckIn;
        if (corrections[cIdx].requestedCheckOut) records[rIdx].checkOutTime = corrections[cIdx].requestedCheckOut;

        if (records[rIdx].checkInTime && records[rIdx].checkOutTime) {
          const s = new Date(records[rIdx].checkInTime!).getTime();
          const e = new Date(records[rIdx].checkOutTime!).getTime();
          const mins = (e - s) / 60000 - (records[rIdx].totalBreakDuration || 0);
          records[rIdx].workingHours = Number((mins / 60).toFixed(2));
        }

        records[rIdx].lastUpdatedAt = getServerTime();
        saveRecords(records);
        logAudit(records[rIdx].id, "CorrectionApproved", `Correction applied: CheckIn: ${records[rIdx].checkInTime}, CheckOut: ${records[rIdx].checkOutTime}`);
      }
      emitAttendanceEvent("corrections_updated", { message: "Correction request approved.", severity: "success" });
    } else {
      logAudit(corrections[cIdx].recordId, "CorrectionRejected", `Correction rejected by manager. Reason: ${managerComment}`);
      emitAttendanceEvent("corrections_updated", { message: "Correction request rejected.", severity: "warning" });
    }

    saveCorrections(corrections);
  },

  getAuditLogs: async (): Promise<AttendanceAuditLog[]> => {
    const actor = getCurrentAttendanceActor();
    assertAttendanceAccess("attendance_audit", "read", actor.department);
    return getStoredAudit();
  },

  /**
   * Clear all attendance related data from localStorage. Useful for resetting the
   * application state during development or testing.
   */
  clearAllData: (): void => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CORRECTIONS_KEY);
    localStorage.removeItem(AUDIT_KEY);
    localStorage.removeItem(SERVER_TIME_OFFSET_KEY);
    // Emit events so any listeners can react to the purge.
    window.dispatchEvent(new Event("attendance_updated"));
    window.dispatchEvent(new Event("corrections_updated"));
    window.dispatchEvent(new Event("attendance_audit_updated"));
  }
};
