import { NavLink } from "react-router-dom";

import type {
  Permission,
  User,
} from "../types/auth";

import { hasPermission } from "../utils/permissions";

interface SidebarProps {
  user: User;
}

const navigation: {
  label: string;
  path: string;
  permission: Permission;
  icon: string;
}[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    permission: "dashboard:view",
    icon: "📊",
  },
  {
    label: "Workforce",
    path: "/workforce",
    permission: "workforce:view",
    icon: "👥",
  },
  {
    label: "Employees",
    path: "/employees",
    permission: "employees:view",
    icon: "👤",
  },
  {
    label: "Reports",
    path: "/reports",
    permission: "reports:view",
    icon: "📈",
  },
  {
    label: "Settings",
    path: "/settings",
    permission: "settings:view",
    icon: "⚙️",
  },
];

function Sidebar({
  user,
}: SidebarProps) {

  return (
    <aside className="sidebar">

      <div className="logo">
        Workforce
      </div>

      <nav
        className="sidebar-nav"
        aria-label="Main navigation"
      >

        {navigation
          .filter((item) =>
            hasPermission(
              user.role,
              item.permission,
            ),
          )
          .map((item) => (

            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "nav-item active"
                  : "nav-item"
              }
            >
              <span>{item.icon}</span>

              <span>
                {item.label}
              </span>
            </NavLink>

          ))}

      </nav>

    </aside>
  );
}

export default Sidebar;