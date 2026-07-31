// ====================================
// File: src/constants/roles.ts
// ====================================

import type { UserRole } from "../types/auth";

export const ROLES = {
  ADMIN: "Admin",
  HR: "HR",
  MANAGER: "Manager",
} as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  Admin: "Administrator",
  HR: "Human Resources",
  Manager: "Manager",
};

export const DASHBOARD_ROUTES: Record<
  UserRole,
  string
> = {
  Admin: "/admin/dashboard",
  HR: "/hr/dashboard",
  Manager: "/manager/dashboard",
};

export const DEFAULT_ROUTES: Record<
  UserRole,
  string
> = {
  Admin: "/admin/dashboard",
  HR: "/hr/dashboard",
  Manager: "/manager/dashboard",
};

export const ROLE_COLORS: Record<
  UserRole,
  string
> = {
  Admin: "#1976d2",
  HR: "#7b1fa2",
  Manager: "#2e7d32",
};

export const ROLE_ICONS: Record<
  UserRole,
  string
> = {
  Admin: "🛡️",
  HR: "👥",
  Manager: "📊",
};

export const ALL_ROLES: UserRole[] = [
  ROLES.ADMIN,
  ROLES.HR,
  ROLES.MANAGER,
];