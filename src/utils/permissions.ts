// ====================================
// File: src/utils/permissions.ts
// ====================================

import type { UserRole } from "../types/auth";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  Admin: 3,
  HR: 2,
  Manager: 1,
};

export const hasRole = (
  userRole: UserRole,
  allowedRoles: UserRole[]
): boolean => {
  return allowedRoles.includes(userRole);
};

export const hasMinimumRole = (
  userRole: UserRole,
  minimumRole: UserRole
): boolean => {
  return (
    ROLE_HIERARCHY[userRole] >=
    ROLE_HIERARCHY[minimumRole]
  );
};

export const canAccessDashboard = (
  role: UserRole
) => {
  return hasRole(role, [
    "Admin",
    "HR",
    "Manager",
  ]);
};

export const canManageEmployees = (
  role: UserRole
) => {
  return hasRole(role, [
    "Admin",
    "HR",
  ]);
};

export const canViewAnalytics = (
  role: UserRole
) => {
  return hasRole(role, [
    "Admin",
    "HR",
  ]);
};

export const canViewReports = (
  role: UserRole
) => {
  return hasRole(role, [
    "Admin",
    "HR",
    "Manager",
  ]);
};

export const canAccessSettings = (
  role: UserRole
) => {
  return role === "Admin";
};

export const canManageUsers = (
  role: UserRole
) => {
  return role === "Admin";
};

export const canManageRoles = (
  role: UserRole
) => {
  return role === "Admin";
};

export const canExportReports = (
  role: UserRole
) => {
  return hasRole(role, [
    "Admin",
    "HR",
  ]);
};

export const canApproveLeave = (
  role: UserRole
) => {
  return hasRole(role, [
    "Admin",
    "HR",
    "Manager",
  ]);
};

export const canEditProfile = (
  role: UserRole
) => {
  return hasRole(role, [
    "Admin",
    "HR",
    "Manager",
  ]);
};

export const isAdmin = (
  role: UserRole
) => role === "Admin";

export const isHR = (
  role: UserRole
) => role === "HR";

export const isManager = (
  role: UserRole
) => role === "Manager";
