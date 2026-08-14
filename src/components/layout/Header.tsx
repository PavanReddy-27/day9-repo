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

  const getProfileAvatar = (user: User) => {
    const seed = user.username;
    const role = user.role.toLowerCase();
    const designation = (user.designation || "").toLowerCase();

    // Developer / Tech roles
    if (designation.includes('developer') || designation.includes('engineer') || designation.includes('tech') || designation.includes('software')) {
      return `https://api.dicebear.com/9.x/micah/svg?seed=${seed}dev&backgroundColor=b6e3f4`;
    }
    
    // HR roles
    if (role.includes('hr') || designation.includes('hr') || designation.includes('human resources')) {
      return `https://api.dicebear.com/9.x/micah/svg?seed=${seed}hr&backgroundColor=ffdfbf`;
    }

    // Manager / Executive / Team Lead roles
    if (role.includes('manager') || role.includes('lead') || designation.includes('manager') || designation.includes('lead') || designation.includes('head') || designation.includes('director')) {
      return `https://api.dicebear.com/9.x/micah/svg?seed=${seed}manager&backgroundColor=c0aede`;
    }

    // Admin
    if (role.includes('admin') || designation.includes('admin')) {
      return `https://api.dicebear.com/9.x/micah/svg?seed=${seed}admin&backgroundColor=d1d4f9`;
    }

    // Generic Employee fallback
    return `https://api.dicebear.com/9.x/micah/svg?seed=${seed}&backgroundColor=ffd5dc`;
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
            src={getProfileAvatar(user)}
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