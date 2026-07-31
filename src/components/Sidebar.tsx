import { NavLink } from "react-router-dom";

import type {
  User,
  UserRole,
} from "../types/auth";

interface SidebarProps {
  user: User;
}

const navigation: {
  label: string;
  path: string;
  allowedRoles: UserRole[];
  icon: string;
}[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    allowedRoles: ["Admin", "HR", "Manager"],
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
    label: "Reports",
    path: "/reports",
    allowedRoles: ["Admin", "HR", "Manager"],
    icon: "📈",
  },
  {
    label: "Settings",
    path: "/settings",
    allowedRoles: ["Admin"],
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
            item.allowedRoles.includes(user.role),
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