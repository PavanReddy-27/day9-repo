import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiBarChart2,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { FaUsersCog } from "react-icons/fa";
import "./Sidebar.css";

interface SidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <FiHome />,
  },
  {
    name: "Employees",
    path: "/employees",
    icon: <FiUsers />,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: <FiBarChart2 />,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: <FiFileText />,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: <FiSettings />,
  },
];

const Sidebar = ({
  sidebarOpen,
  toggleSidebar,
  closeSidebar,
}: SidebarProps) => {
  return (
    <aside className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
      <div className="sidebar-top">
        <div className="logo-section">
          <div className="logo-circle">
            <FaUsersCog />
          </div>

          {sidebarOpen && (
            <div className="logo-text">
              <h2>WorkForce</h2>
              <p>Analytics</p>
            </div>
          )}
        </div>

        <button
          className="collapse-btn"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          {sidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
        </button>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <span className="menu-icon">{item.icon}</span>

            {sidebarOpen && (
              <span className="menu-text">
                {item.name}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="logout-btn"
          onClick={() => alert("Logout functionality will be added later")}
        >
          <FiLogOut />

          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;