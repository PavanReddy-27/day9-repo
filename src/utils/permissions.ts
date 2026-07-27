import type {
  Permission,
  Role,
} from "../types/auth";

const rolePermissions: Record<
  Role,
  Permission[]
> = {
  admin: [
    "dashboard:view",
    "workforce:view",
    "employees:view",
    "reports:view",
    "settings:view",
  ],

  hr: [
    "dashboard:view",
    "workforce:view",
    "employees:view",
    "reports:view",
  ],

  manager: [
    "dashboard:view",
    "workforce:view",
    "employees:view",
    "reports:view",
  ],

  analyst: [
    "dashboard:view",
    "workforce:view",
    "reports:view",
  ],
};

export function hasPermission(
  role: Role,
  permission: Permission,
): boolean {
  return rolePermissions[role].includes(
    permission,
  );
}