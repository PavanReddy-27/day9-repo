import { NavLink, useNavigate } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import companyLogo from "../../assets/company-logo.png";
import LogoutIcon from "@mui/icons-material/Logout";
import { useDispatch } from "react-redux";
import { navigationItems } from "../../config/navigation";

import { logout } from "../../redux/authSlice";
import authApi from "../../services/authApi";
import type { User } from "../../types/auth";

import "./Sidebar.css";

interface SidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  user: User;
}

const Sidebar = ({
  sidebarOpen,
  toggleSidebar,
  closeSidebar,
  user,
}: SidebarProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();



  const handleLogout = () => {
    authApi.logout();

    dispatch(logout());

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <aside
      className={`sidebar ${sidebarOpen ? "" : "collapsed"
        }`}
    >
      <div className="sidebar-top">
        <div className="logo-section" style={{ padding: sidebarOpen ? "0 8px" : "0", display: "flex", justifyContent: "center", overflow: "hidden" }}>
          {sidebarOpen ? (
            <img src={companyLogo} alt="Stackly Logo" style={{ height: "44px", width: "auto", objectFit: "contain" }} />
          ) : (
            <img src={companyLogo} alt="Stackly Logo" style={{ height: "38px", width: "38px", objectFit: "cover", objectPosition: "left" }} />
          )}
        </div>

        <button
          className="collapse-btn"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          {sidebarOpen ? (
            <FiChevronLeft />
          ) : (
            <FiChevronRight />
          )}
        </button>
      </div>

      <nav className="sidebar-menu">
        {navigationItems
          .filter((item) =>
            item.roles.includes(user.role)
          )
          .map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.route}
                to={`/${user.role.toLowerCase()}/${item.route}`}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  isActive
                    ? "menu-item active"
                    : "menu-item"
                }
              >
                <span className="menu-icon">
                  <Icon />
                </span>

                {sidebarOpen && (
                  <span className="menu-text">
                    {item.name}
                  </span>
                )}
              </NavLink>
            );
          })}
      </nav>

      <div className="sidebar-footer">
        <button
          className="logout-btn"
          onClick={handleLogout}
          title={
            !sidebarOpen
              ? "Logout"
              : undefined
          }
        >
          <LogoutIcon fontSize="small" />

          {sidebarOpen && (
            <span>Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;