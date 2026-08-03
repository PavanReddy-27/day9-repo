import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiClipboard,
  FiTrendingUp,
  FiPieChart,
} from "react-icons/fi";

import "./ManagerSidebar.css";

const menuItems = [
  {
    name: "Dashboard",
    path: "/manager/dashboard",
    icon: <FiHome />,
  },
  {
    name: "My Team",
    path: "/manager/team",
    icon: <FiUsers />,
  },
  {
    name: "Attendance",
    path: "/manager/attendance",
    icon: <FiCalendar />,
  },
  {
    name: "Leave Requests",
    path: "/manager/leave-requests",
    icon: <FiClipboard />,
  },
  {
    name: "Performance",
    path: "/manager/performance",
    icon: <FiTrendingUp />,
  },
  {
    name: "Analytics",
    path: "/manager/analytics",
    icon: <FiPieChart />,
  },
];

const ManagerSidebar = () => {
  return (
    <aside className="manager-sidebar">
      <div className="manager-logo">
        <div className="logo-circle">M</div>

        <div>
          <h2>Manager Portal</h2>
          <p>Workforce Analytics</p>
        </div>
      </div>

      <div className="sidebar-title">
        Navigation
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "menu active" : "menu"
            }
          >
            <span className="menu-icon">
              {item.icon}
            </span>

            <span className="menu-text">
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <small>Manager Dashboard v1.0</small>
      </div>
    </aside>
  );
};

export default ManagerSidebar;

