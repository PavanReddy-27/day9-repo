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
  };

  return rolePermissions[role].includes(permission);
}