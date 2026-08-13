import {
  FiBell,
  FiSearch,
  FiMenu,
  FiChevronDown,
  FiLogOut,
} from "react-icons/fi";


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { logout } from "../../redux/authSlice";
import authApi from "../../services/authApi";
import type { User } from "../../types/auth";

import ThemeToggle from "./ThemeToggle";

import "./Header.css";

interface HeaderProps {
  toggleSidebar: () => void;
  user: User;
}

const Header = ({
  toggleSidebar,
  user,
}: HeaderProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const handleLogout = () => {
    authApi.logout();

    dispatch(logout());

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header className="header">
      {/* Left */}

      <div className="header-left">
        <button
          className="mobile-menu-btn"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <FiMenu />
        </button>
      </div>

      {/* Right */}

      <div className="header-right">
        <div className="search-box">
          <FiSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search employees..."
          />
        </div>

        <ThemeToggle />

        <button
          className="icon-btn"
          aria-label="Notifications"
        >
          <FiBell />
          <span className="notification-dot"></span>
        </button>

        <div
          className="profile"
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
        >
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/032/176/191/small/business-avatar-profile-black-icon-man-of-user-symbol-in-trendy-flat-style-isolated-on-male-profile-people-diverse-face-for-social-network-or-web-vector.jpg"
            alt="Profile"
          />

          <div className="profile-info">
            <h4>{user.fullName || user.username}</h4>
            <p>{user.role}</p>
          </div>

          <FiChevronDown className="profile-arrow" />

          {menuOpen && (
            <div className="profile-menu">
              <button
                onClick={handleLogout}
              >
                <FiLogOut />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;