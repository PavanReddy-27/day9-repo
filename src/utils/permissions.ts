import type { UserRole } from "../types/auth";

export function hasPermission(
  role: UserRole,
  permission: string,
): boolean {
  const rolePermissions: Record<UserRole, string[]> = {
    Admin: [
      "dashboard:view",
      "workforce:view",
      "employees:view",
      "reports:view",
      "settings:view",
    ],
    HR: [
      "dashboard:view",
      "workforce:view",
      "employees:view",
      "reports:view",
    ],
    Manager: [
      "dashboard:view",
      "workforce:view",
      "employees:view",
      "reports:view",
    ],
    "Team Lead": [
      "dashboard:view",
      "workforce:view",
      "employees:view",
    ],
    Employee: [
      "dashboard:view",
    ],
  };

  return rolePermissions[role].includes(permission);
}

export const canAccessDashboard = (role: UserRole) => hasPermission(role, "dashboard:view");
export const canManageEmployees = (role: UserRole) => role === "Admin" || role === "HR";
export const canViewAnalytics = () => true;
export const canViewReports = () => true;
export const canAccessSettings = (role: UserRole) => role === "Admin";
export const canManageUsers = (role: UserRole) => role === "Admin";
export const canManageRoles = (role: UserRole) => role === "Admin";
export const canExportReports = () => true;
export const canApproveLeave = (role: UserRole) => role === "Manager" || role === "HR";
export const canEditProfile = () => true;

export const isAdmin = (role: UserRole) => role === "Admin";
export const isHR = (role: UserRole) => role === "HR";
export const isManager = (role: UserRole) => role === "Manager";
