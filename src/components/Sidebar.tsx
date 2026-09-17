import { NavLink } from "react-router-dom";

import type { User } from "../types/auth";
import { navigation } from "../config/navigation";
import { hasPermission } from "../utils/permissions";

interface SidebarProps {
  user: User;
}

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
            item.permission
              ? hasPermission(user.role, item.permission)
              : true,
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