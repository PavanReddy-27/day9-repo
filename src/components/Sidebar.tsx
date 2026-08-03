import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const menuItems = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Users", path: "/admin/users" },
  { label: "Roles", path: "/admin/roles" },
  { label: "Departments", path: "/admin/departments" },
  { label: "Reports", path: "/admin/reports" },
  { label: "Audit Logs", path: "/admin/audit-logs" },
  { label: "Settings", path: "/admin/settings" },
];

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="logo">
        AdminPro
      </div>

      <nav className="menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;