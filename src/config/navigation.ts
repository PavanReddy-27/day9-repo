import {
  FiHome,
  FiUsers,
  FiBarChart2,
  FiFileText,
  FiSettings,
  FiShield,
  FiBriefcase,
  FiClock,
  FiCalendar,
  FiTarget,
  FiActivity
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
  // Admin Navigation
  { name: "Dashboard", icon: FiHome, route: "dashboard", roles: ["Admin"] },
  { name: "Users", icon: FiUsers, route: "users", roles: ["Admin"] },
  { name: "Roles", icon: FiShield, route: "roles", roles: ["Admin"] },
  { name: "Departments", icon: FiBriefcase, route: "departments", roles: ["Admin"] },
  { name: "Reports", icon: FiFileText, route: "reports", roles: ["Admin"] },
  { name: "Audit Logs", icon: FiActivity, route: "audit-logs", roles: ["Admin"] },
  { name: "Settings", icon: FiSettings, route: "settings", roles: ["Admin"] },

  // HR Navigation
  { name: "Dashboard", icon: FiHome, route: "dashboard", roles: ["HR"] },
  { name: "Employees", icon: FiUsers, route: "employees", roles: ["HR"] },
  { name: "Recruitment", icon: FiBriefcase, route: "recruitment", roles: ["HR"] },
  { name: "Attendance", icon: FiClock, route: "attendance", roles: ["HR"] },
  { name: "Leave Requests", icon: FiCalendar, route: "leave-requests", roles: ["HR"] },
  { name: "Performance", icon: FiTarget, route: "performance", roles: ["HR"] },
  { name: "Analytics", icon: FiBarChart2, route: "analytics", roles: ["HR"] },
  { name: "Reports", icon: FiFileText, route: "reports", roles: ["HR"] },

  // Manager Navigation
  { name: "Dashboard", icon: FiHome, route: "dashboard", roles: ["Manager"] },
  { name: "Team", icon: FiUsers, route: "team", roles: ["Manager"] },
  { name: "Attendance", icon: FiClock, route: "attendance", roles: ["Manager"] },
  { name: "Leave Requests", icon: FiCalendar, route: "leave-requests", roles: ["Manager"] },
  { name: "Performance", icon: FiTarget, route: "performance", roles: ["Manager"] },
  { name: "Analytics", icon: FiBarChart2, route: "analytics", roles: ["Manager"] },
];