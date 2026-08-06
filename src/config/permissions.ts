// src/config/permissions.ts

import type { PermissionMap, UserRole } from "../types/auth";

/**
 * ==========================================
 * Workforce Analytics Dashboard
 * Centralized Permission Configuration
 * ==========================================
 */

const FULL_ACCESS = {
  read: true,
  create: true,
  update: true,
  delete: true,
  export: true,
};

const READ_ONLY = {
  read: true,
  create: false,
  update: false,
  delete: false,
  export: false,
};

const NO_ACCESS = {
  read: false,
  create: false,
  update: false,
  delete: false,
  export: false,
};

export const PERMISSIONS: Record<UserRole, PermissionMap> = {
  Admin: {
    dashboard: FULL_ACCESS,

    users: FULL_ACCESS,

    employees: FULL_ACCESS,

    departments: FULL_ACCESS,

    recruitment: FULL_ACCESS,

    attendance: FULL_ACCESS,

    leave: FULL_ACCESS,

    analytics: FULL_ACCESS,

    reports: FULL_ACCESS,

    settings: FULL_ACCESS,

    auditLogs: FULL_ACCESS,
  },

  HR: {
    dashboard: {
      ...FULL_ACCESS,
      delete: false,
    },

    users: NO_ACCESS,

    employees: FULL_ACCESS,

    departments: {
      read: true,
      create: false,
      update: false,
      delete: false,
      export: false,
    },

    recruitment: FULL_ACCESS,

    attendance: FULL_ACCESS,

    leave: FULL_ACCESS,

    analytics: FULL_ACCESS,

    reports: FULL_ACCESS,

    settings: READ_ONLY,

    auditLogs: NO_ACCESS,
  },

  Manager: {
    dashboard: READ_ONLY,

    users: NO_ACCESS,

    employees: {
      read: true,
      create: false,
      update: true,
      delete: false,
      export: true,
    },

    departments: READ_ONLY,

    recruitment: NO_ACCESS,

    attendance: {
      read: true,
      create: false,
      update: true,
      delete: false,
      export: true,
    },

    leave: {
      read: true,
      create: false,
      update: true,
      delete: false,
      export: false,
    },

    analytics: READ_ONLY,

    reports: {
      read: true,
      create: false,
      update: false,
      delete: false,
      export: true,
    },

    settings: NO_ACCESS,

    auditLogs: NO_ACCESS,
  },

  Employee: {
    dashboard: READ_ONLY,
    users: NO_ACCESS,
    employees: NO_ACCESS,
    departments: NO_ACCESS,
    recruitment: NO_ACCESS,
    attendance: {
      read: true,
      create: true,
      update: true,
      delete: false,
      export: false,
    },
    leave: {
      read: true,
      create: true,
      update: false,
      delete: false,
      export: false,
    },
    analytics: NO_ACCESS,
    reports: NO_ACCESS,
    settings: NO_ACCESS,
    auditLogs: NO_ACCESS,
  },
};

/**
 * Check whether a role can perform
 * a specific action on a resource.
 */
export const hasPermission = (
  role: UserRole,
  resource: keyof PermissionMap,
  action: "read" | "create" | "update" | "delete" | "export"
): boolean => {
  return PERMISSIONS[role][resource][action];
};

/**
 * Returns all permissions
 * for a role.
 */
export const getPermissions = (
  role: UserRole
): PermissionMap => {
  return PERMISSIONS[role];
};

/**
 * Returns true if the role
 * has read access.
 */
export const canRead = (
  role: UserRole,
  resource: keyof PermissionMap
): boolean => {
  return PERMISSIONS[role][resource].read;
};

export const canCreate = (
  role: UserRole,
  resource: keyof PermissionMap
): boolean => {
  return PERMISSIONS[role][resource].create;
};

export const canUpdate = (
  role: UserRole,
  resource: keyof PermissionMap
): boolean => {
  return PERMISSIONS[role][resource].update;
};

export const canDelete = (
  role: UserRole,
  resource: keyof PermissionMap
): boolean => {
  return PERMISSIONS[role][resource].delete;
};

export const canExport = (
  role: UserRole,
  resource: keyof PermissionMap
): boolean => {
  return PERMISSIONS[role][resource].export;
};