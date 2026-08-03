import type { UserRole } from '../types/auth';

const defaultPermissions = ['view_dashboard'];

const adminPermissions = [
  'view_dashboard',
  'manage_employees',
  'manage_recruitment',
  'approve_leaves',
  'view_analytics',
  'admin_settings',
];

const hrPermissions = [
  'view_dashboard',
  'manage_employees',
  'manage_recruitment',
  'approve_leaves',
  'view_analytics',
];

const managerPermissions = [
  'view_dashboard',
  'approve_leaves',
  'view_analytics',
];

const analystPermissions = [
  'view_dashboard',
  'view_analytics',
];

export const rolePermissions: Record<UserRole, string[]> = {
  admin: adminPermissions,
  Admin: adminPermissions,
  hr: hrPermissions,
  HR: hrPermissions,
  manager: managerPermissions,
  Manager: managerPermissions,
  analyst: analystPermissions,
};

export const hasPermission = (role: UserRole, permission: string): boolean => {
  const permissions = rolePermissions[role] || defaultPermissions;
  return permissions.includes(permission);
};