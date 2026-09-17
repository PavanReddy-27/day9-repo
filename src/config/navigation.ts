import type { Permission, UserRole } from "../types/auth";

export interface NavItem {
  label: string;
  path: string;
  permission?: Permission;
  roles?: UserRole[];
  icon?: string;
}

export const navigation: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    permission: "dashboard:view",
    roles: ["admin", "hr", "manager", "analyst"],
    icon: "📊",
  },
  {
    label: "Workforce",
    path: "/workforce",
    permission: "workforce:view",
    roles: ["admin", "hr", "manager"],
    icon: "👥",
  },
  {
    label: "Employees",
    path: "/employees",
    permission: "employees:view",
    roles: ["admin", "hr", "manager"],
    icon: "👤",
  },
  {
    label: "Reports",
    path: "/reports",
    permission: "reports:view",
    roles: ["admin", "hr", "manager", "analyst"],
    icon: "📈",
  },
  {
    label: "Settings",
    path: "/settings",
    permission: "settings:view",
    roles: ["admin"],
    icon: "⚙️",
  },
];

export default navigation;
