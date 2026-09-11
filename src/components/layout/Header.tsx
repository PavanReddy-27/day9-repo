import {
  FiBell,
  FiSearch,
  FiMenu,
  FiChevronDown,
  FiLogOut,
  FiUser,
  FiCheck,
  FiTrash2,
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
    fetchNotifications();
    const handleUpdate = () => fetchNotifications();
    window.addEventListener("notification_updated", handleUpdate);
    return () => window.removeEventListener("notification_updated", handleUpdate);
  }, [user?.id, user?.email]);

  const handleGenerateAlert = async () => {
    try {
      await notificationApi.generateNotification();
      fetchNotifications();
    } catch (err) {
      console.error("Failed to generate alert", err);
    }
  };

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

  const handleRemoveNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Optimistic update
      setNotifications(prev => prev.filter(n => n._id !== id));
      await notificationApi.deleteNotification(id);
    } catch (err) {
      console.error("Failed to remove notification", err);
      fetchNotifications();
    }
  };

  const handleClearAll = async () => {
    try {
      // Optimistic update
      setNotifications([]);
      await notificationApi.clearAll();
    } catch (err) {
      console.error("Failed to clear all notifications", err);
      fetchNotifications();
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
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Search anything..." />
          <span className="search-shortcut">⌘K</span>
        </div>
      </div>

      {/* Right */}
      <div className="header-right">
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4>Notifications</h4>
                  <button 
                    className="generate-alert-btn" 
                    onClick={handleGenerateAlert}
                    title="Generate a new personalized notification for your role"
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: 'var(--hover)',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    + Test Alert
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {unreadCount > 0 && (
                    <button 
                      className="mark-all-read" 
                      onClick={async () => { 
                        await notificationApi.markAllAsRead(); 
                        fetchNotifications(); 
                      }}
                      title="Mark all notifications as read"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button 
                      className="clear-all-notifs" 
                      onClick={handleClearAll}
                      title="Clear all notifications"
                    >
                      Clear all
                    </button>
                  )}
                </div>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            background: notif.type === 'ALERT' ? 'rgba(239, 68, 68, 0.15)' : notif.type === 'WARNING' ? 'rgba(245, 158, 11, 0.15)' : notif.type === 'SUCCESS' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                            color: notif.type === 'ALERT' ? '#ef4444' : notif.type === 'WARNING' ? '#f59e0b' : notif.type === 'SUCCESS' ? '#10b981' : '#3b82f6',
                          }}>
                            {notif.type}
                          </span>
                          <strong>{notif.title}</strong>
                        </div>
                        <p>{notif.message}</p>
                        <span className="notification-time">
                          {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div className="notification-actions">
                        {!notif.isRead && (
                          <button 
                            className="mark-read-btn" 
                            onClick={(e) => handleMarkAsRead(notif._id, e)}
                            title="Mark as read"
                          >
                            <FiCheck />
                          </button>
                        )}
                        <button 
                          className="remove-notif-btn" 
                          onClick={(e) => handleRemoveNotification(notif._id, e)}
                          title="Remove notification"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
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
            <h4>{user.fullName || user.username || "User"}</h4>
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