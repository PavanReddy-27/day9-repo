import React from "react";
import { NavLink } from "react-router-dom";
import type { User, UserRole } from "../types/auth";

interface SidebarProps {
  user: User;
}

interface NavigationItem {
  label: string;
  path: string;
  allowedRoles: UserRole[];
  icon: string;
}

const navigation: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    allowedRoles: ["Admin", "HR", "Manager", "Team Lead"],
    icon: "📊",
  },
  {
    label: "Workforce",
    path: "/workforce",
    allowedRoles: ["Admin", "HR", "Manager"],
    icon: "👥",
  },
  {
    label: "Employees",
    path: "/employees",
    allowedRoles: ["Admin", "HR"],
    icon: "👤",
  },
  {
    label: "Recruitment",
    path: "/recruitment",
    allowedRoles: ["Admin", "HR"],
    icon: "💼",
  },
  {
    label: "Attendance",
    path: "/attendance",
    allowedRoles: ["Admin", "HR"],
    icon: "⏰",
  },
  {
    label: "Leave Workflow",
    path: "/leave",
    allowedRoles: ["Admin", "HR"],
    icon: "🌴",
  },
  {
    label: "Performance",
    path: "/performance",
    allowedRoles: ["Admin", "HR", "Manager"],
    icon: "⭐",
  },
  {
    label: "Reports",
    path: "/reports",
    allowedRoles: ["Admin", "HR", "Manager"],
    icon: "📈",
  },
  {
    label: "HR Analytics",
    path: "/analytics",
    allowedRoles: ["Admin", "HR"],
    icon: "📉",
  },
  {
    label: "Settings",
    path: "/settings",
    allowedRoles: ["Admin"],
    icon: "⚙️",
  },
];

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  return (
    <aside className="sidebar">
      <div className="logo">Workforce HR</div>

      <nav
        className="sidebar-nav"
        aria-label="Main Navigation"
      >
        {navigation
          .filter((item) => item.allowedRoles.includes(user.role))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
      </nav>
    </aside>
  );
};

export default Sidebar;