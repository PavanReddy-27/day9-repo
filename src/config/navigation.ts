// ====================================
// File: src/config/navigation.ts
// ====================================

import {
  FiHome,
  FiUsers,
  FiBarChart2,
  FiFileText,
  FiSettings,
} from "react-icons/fi";

import type { IconType } from "react-icons";

import type { UserRole } from "../types/auth";

export interface NavigationItem {
  name: string;
  icon: IconType;
  route: string;
  roles: UserRole[];
}

export const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    icon: FiHome,
    route: "dashboard",
    roles: ["Admin", "HR", "Manager"],
  },
  {
    name: "Employees",
    icon: FiUsers,
    route: "employees",
    roles: ["Admin", "HR", "Manager"],
  },
  {
    name: "Analytics",
    icon: FiBarChart2,
    route: "analytics",
    roles: ["Admin", "HR"],
  },
  {
    name: "Reports",
    icon: FiFileText,
    route: "reports",
    roles: ["Admin", "HR", "Manager"],
  },
  {
    name: "Settings",
    icon: FiSettings,
    route: "settings",
    roles: ["Admin"],
  },
];