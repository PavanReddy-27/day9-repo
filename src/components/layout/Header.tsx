
import {
    FiBell,
    FiSearch,
    FiMenu,
    FiChevronDown,
  } from "react-icons/fi";
  import ThemeToggle from "./ThemeToggle";
  import companyLogo from "../../assets/company-logo.png";
  import "./Header.css";
  
  interface HeaderProps {
    toggleSidebar: () => void;
  }
  
  const Header = ({ toggleSidebar }: HeaderProps) => {
    return (
      <header className="header">
        {/* Left Section */}
        <div className="header-left">
          <button
            className="mobile-menu-btn"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <FiMenu />
          </button>
  
          <div className="company-logo">
            <img
              src={companyLogo}
              alt="Company Logo"
            />
          </div>
        </div>
  
        {/* Right Section */}
        <div className="header-right">
          {/* Search */}
          <div className="search-box">
            <FiSearch className="search-icon" />
  
            <input
              type="text"
              placeholder="Search employees..."
            />
          </div>
  
          {/* Theme Toggle */}
          <ThemeToggle />
  
          {/* Notification */}
          <button
            className="icon-btn"
            aria-label="Notifications"
          >
            <FiBell />
  
            <span className="notification-dot"></span>
          </button>
  
          {/* Profile */}
          <div className="profile">
            <img
              src="https://static.vecteezy.com/system/resources/thumbnails/032/176/191/small/business-avatar-profile-black-icon-man-of-user-symbol-in-trendy-flat-style-isolated-on-male-profile-people-diverse-face-for-social-network-or-web-vector.jpg"
              alt="Profile"
            />
  
            <div className="profile-info">
              <h4>Team-2</h4>
              <p>Frontend Developer</p>
            </div>
  
            <FiChevronDown className="profile-arrow" />
          </div>
        </div>
      </header>
    );
  };
  
  export default Header;