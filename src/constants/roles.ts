// ====================================
// File: src/constants/roles.ts
// ====================================

import type { UserRole } from "../types/auth";

export const ROLES = {
  ADMIN: "Admin",
  HR: "HR",
  MANAGER: "Manager",
  TEAM_LEAD: "Team Lead",
  EMPLOYEE: "Employee",
} as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  Admin: "Administrator",
  HR: "Human Resources",
  Manager: "Manager",
  "Team Lead": "Team Lead",
  Employee: "Employee",
};

export const DASHBOARD_ROUTES: Record<
  UserRole,
  string
> = {
  Admin: "/admin/dashboard",
  HR: "/hr/dashboard",
  Manager: "/manager/dashboard",
  "Team Lead": "/teamlead/dashboard",
  Employee: "/employee/dashboard",
};

export const DEFAULT_ROUTES: Record<
  UserRole,
  string
> = {
  Admin: "/admin/dashboard",
  HR: "/hr/dashboard",
  Manager: "/manager/dashboard",
  "Team Lead": "/teamlead/dashboard",
  Employee: "/employee/dashboard",
};

export const ROLE_COLORS: Record<
  UserRole,
  string
> = {
  Admin: "var(--primary)",
  HR: "#7b1fa2",
  Manager: "var(--success)",
  "Team Lead": "var(--warning)",
  Employee: "#f57c00",
};

export const ROLE_ICONS: Record<
  UserRole,
  string
> = {
  Admin: "🛡️",
  HR: "👥",
  Manager: "📊",
  "Team Lead": "⭐",
  Employee: "👨‍💻",
};

export const ALL_ROLES: UserRole[] = [
  ROLES.ADMIN,
  ROLES.HR,
  ROLES.MANAGER,
  ROLES.TEAM_LEAD,
  ROLES.EMPLOYEE,
];