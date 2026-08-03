// ====================================
// File: src/config/navigation.ts
// ====================================

import {
  FiHome,
  FiUsers,
  FiBarChart2,
  FiFileText,
  FiSettings,
  FiBriefcase,
  FiList,
  FiShield,
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
  // Shared by All
  { name: "Dashboard", icon: FiHome, route: "dashboard", roles: ["Admin", "HR", "Manager"] },

  // Shared by HR & Manager
  { name: "Analytics", icon: FiBarChart2, route: "analytics", roles: ["HR", "Manager"] },

  // HR Only
  { name: "Employees", icon: FiUsers, route: "employees", roles: ["HR"] },

  // Admin Only
  { name: "Users", icon: FiUsers, route: "users", roles: ["Admin"] },
  { name: "Roles", icon: FiShield, route: "roles", roles: ["Admin"] },
  { name: "Departments", icon: FiBriefcase, route: "departments", roles: ["Admin"] },
  { name: "Audit Logs", icon: FiList, route: "audit-logs", roles: ["Admin"] },
  { name: "Reports", icon: FiFileText, route: "reports", roles: ["Admin"] },
  { name: "Settings", icon: FiSettings, route: "settings", roles: ["Admin"] },

  // Shared by HR & Manager
  { name: "Attendance", icon: FiFileText, route: "attendance", roles: ["HR", "Manager"] },
  { name: "Leave Requests", icon: FiFileText, route: "leave-requests", roles: ["HR", "Manager"] },
  { name: "Performance", icon: FiBarChart2, route: "performance", roles: ["HR", "Manager"] },

  // HR Only
  { name: "Recruitment", icon: FiUsers, route: "recruitment", roles: ["HR"] },

  // Manager Only
  { name: "My Team", icon: FiUsers, route: "team", roles: ["Manager"] },
];