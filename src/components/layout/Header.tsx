import {
  FiBell,
  FiSearch,
  FiMenu,
  FiChevronDown,
  FiLogOut,
  FiUser,
  FiCheck,
} from "react-icons/fi";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { logout } from "../../redux/authSlice";
import authApi from "../../services/authApi";
import { notificationApi, Notification } from "../../services/notificationApi";
import type { User } from "../../types/auth";

import ThemeToggle from "./ThemeToggle";

import "./Header.css";

interface HeaderProps {
  toggleSidebar: () => void;
  user: User;
}

const Header = ({ toggleSidebar, user }: HeaderProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  
  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
    const handleUpdate = () => fetchNotifications();
    window.addEventListener("notification_updated", handleUpdate);
    return () => window.removeEventListener("notification_updated", handleUpdate);
  }, []);

  // Click outside to close notification popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    authApi.logout();
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.isRead) {
      notificationApi.markAsRead(notif._id).then(() => fetchNotifications());
    }
    if (notif.linkUrl) {
      navigate(notif.linkUrl);
    }
    setShowNotifications(false);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
          <input type="text" placeholder="Search..." />
        </div>

        <ThemeToggle />

        {/* Notifications */}
        <div className="notification-wrapper" ref={notifRef}>
          <button
            className="icon-btn"
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FiBell />
            {unreadCount > 0 && (
              <span className="notification-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-popup">
              <div className="notification-header">
                <h4>Notifications</h4>
                {unreadCount > 0 && (
                  <button 
                    className="mark-all-read" 
                    onClick={async () => { 
                      await notificationApi.markAllAsRead(); 
                      fetchNotifications(); 
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">No notifications</div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif._id} 
                      className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="notification-content">
                        <strong>{notif.title}</strong>
                        <p>{notif.message}</p>
                        <span className="notification-time">
                          {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      {!notif.isRead && (
                        <button 
                          className="mark-read-btn" 
                          onClick={(e) => handleMarkAsRead(notif._id, e)}
                          title="Mark as read"
                        >
                          <FiCheck />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="profile" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="profile-icon-container">
            <FiUser />
          </div>

          <div className="profile-info">
            <h4>{user.role === "Manager" ? "Sridhika" : (user.fullName || user.username)}</h4>
            <p>{user.role}</p>
          </div>

          <FiChevronDown className="profile-arrow" />

          {menuOpen && (
            <div className="profile-menu">
              <button onClick={handleLogout}>
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