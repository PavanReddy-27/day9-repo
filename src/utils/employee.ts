// import type { User } from "../types/auth";

/**
 * Returns the canonical employee identifier for a user.
 */
// export const getEmployeeId = (user: User): string => user.employeeId;
//
// Commented out (not deleted) rather than removed: attendanceApi.ts was briefly
// wired to use this (comparing user.employeeId) instead of user.id, which broke
// self-access checks since the rest of the attendance module (Redux thunks,
// AttendanceTracker, CorrectionRequests) all use user.id. Reverted to user.id
// for consistency. Uncomment only if the whole module is intentionally migrated
// to employeeId as the canonical identifier.
