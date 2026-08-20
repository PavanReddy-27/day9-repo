// src/config/roles.ts

import type { UserRole } from "../types/auth";

/**
 * ==========================================
 * Workforce Analytics
 * Role Configuration
 * ==========================================
 */

export const USER_ROLES = {
  ADMIN: "Admin",
  HR: "HR",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
} as const;

export const DEFAULT_ROLE: UserRole = USER_ROLES.HR;

/**
 * Dashboard routes
 */
export const ROLE_DASHBOARD: Record<UserRole, string> = {
  Admin: "/admin/dashboard",
  HR: "/hr/dashboard",
  Manager: "/manager/dashboard",
  Employee: "/employee/dashboard",
};

/**
 * Default landing page after login
 */
export const getDashboardRoute = (role: UserRole): string => {
  return ROLE_DASHBOARD[role];
};

/**
 * Role hierarchy
 * Higher value = Higher privilege
 */
export const ROLE_PRIORITY: Record<UserRole, number> = {
  Admin: 4,
  HR: 3,
  Manager: 2,
  Employee: 1,
};

/**
 * Returns true if current role
 * has equal or higher privilege.
 */
export const hasMinimumRole = (
  currentRole: UserRole,
  requiredRole: UserRole
): boolean => {
  return ROLE_PRIORITY[currentRole] >= ROLE_PRIORITY[requiredRole];
};

/**
 * Route definitions
 */
export const APP_ROUTES = {
  LOGIN: "/login",

  HOME: "/",

  UNAUTHORIZED: "/unauthorized",

  SESSION_EXPIRED: "/session-expired",

  NOT_FOUND: "/404",

  ADMIN: {
    ROOT: "/admin",

    DASHBOARD: "/admin/dashboard",

    USERS: "/admin/users",

    ROLES: "/admin/roles",

    DEPARTMENTS: "/admin/departments",

    REPORTS: "/admin/reports",

    AUDIT_LOGS: "/admin/audit-logs",

    SETTINGS: "/admin/settings",
  },

  HR: {
    ROOT: "/hr",

    DASHBOARD: "/hr/dashboard",

    EMPLOYEES: "/hr/employees",

    RECRUITMENT: "/hr/recruitment",

    ATTENDANCE: "/hr/attendance",

    LEAVE: "/hr/leave",

    PERFORMANCE: "/hr/performance",

    ANALYTICS: "/hr/analytics",

    REPORTS: "/hr/reports",
  },

  MANAGER: {
    ROOT: "/manager",
    DASHBOARD: "/manager/dashboard",
    TEAM: "/manager/team",
    ATTENDANCE: "/manager/attendance",
    LEAVE_REQUESTS: "/manager/leave-requests",
    PERFORMANCE: "/manager/performance",
    ANALYTICS: "/manager/analytics",
  },

  EMPLOYEE: {
    ROOT: "/employee",
    DASHBOARD: "/employee/dashboard",
    ATTENDANCE: "/employee/attendance",
  },
} as const;

/**
 * Allowed routes by role
 */
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  Admin: [
    APP_ROUTES.ADMIN.ROOT,
    APP_ROUTES.ADMIN.DASHBOARD,
    APP_ROUTES.ADMIN.USERS,
    APP_ROUTES.ADMIN.ROLES,
    APP_ROUTES.ADMIN.DEPARTMENTS,
    APP_ROUTES.ADMIN.REPORTS,
    APP_ROUTES.ADMIN.AUDIT_LOGS,
    APP_ROUTES.ADMIN.SETTINGS,
  ],

  HR: [
    APP_ROUTES.HR.ROOT,
    APP_ROUTES.HR.DASHBOARD,
    APP_ROUTES.HR.EMPLOYEES,
    APP_ROUTES.HR.RECRUITMENT,
    APP_ROUTES.HR.ATTENDANCE,
    APP_ROUTES.HR.LEAVE,
    APP_ROUTES.HR.PERFORMANCE,
    APP_ROUTES.HR.ANALYTICS,
    APP_ROUTES.HR.REPORTS,
  ],

  Manager: [
    APP_ROUTES.MANAGER.ROOT,
    APP_ROUTES.MANAGER.DASHBOARD,
    APP_ROUTES.MANAGER.TEAM,
    APP_ROUTES.MANAGER.ATTENDANCE,
    APP_ROUTES.MANAGER.LEAVE_REQUESTS,
    APP_ROUTES.MANAGER.PERFORMANCE,
    APP_ROUTES.MANAGER.ANALYTICS,
  ],

  Employee: [
    APP_ROUTES.EMPLOYEE.ROOT,
    APP_ROUTES.EMPLOYEE.DASHBOARD,
    APP_ROUTES.EMPLOYEE.ATTENDANCE,
  ],
};

/**
 * Check whether the role
 * can access a route.
 */
export const canAccessRoute = (
  role: UserRole,
  pathname: string
): boolean => {
  return ROLE_ROUTES[role].some((route) =>
    pathname.startsWith(route)
  );
};

/**
 * Check if the route is public.
 */
export const isPublicRoute = (pathname: string): boolean => {
  return [
    APP_ROUTES.LOGIN,
    APP_ROUTES.UNAUTHORIZED,
    APP_ROUTES.SESSION_EXPIRED,
    APP_ROUTES.NOT_FOUND,
  ].includes(pathname as (typeof APP_ROUTES)["LOGIN" | "UNAUTHORIZED" | "SESSION_EXPIRED" | "NOT_FOUND"]);
};