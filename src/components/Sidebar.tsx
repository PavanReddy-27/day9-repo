<<<<<<< HEAD
import { NavLink } from "react-router-dom";

import type {
  User,
  UserRole,
} from "../types/auth";

interface SidebarProps {
  user: User;
}

const navigation: {
  label: string;
  path: string;
  allowedRoles: UserRole[];
  icon: string;
}[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    allowedRoles: ["Admin", "HR", "Manager"],
    icon: "📊",
  },
  {
    label: "Workforce",
    path: "/workforce",
    allowedRoles: ["Admin", "HR", "Manager"],
    icon: "👥",
  },
  {
    label: "Employees",
    path: "/employees",
    allowedRoles: ["Admin", "HR"],
    icon: "👤",
  },
  {
    label: "Reports",
    path: "/reports",
    allowedRoles: ["Admin", "HR", "Manager"],
    icon: "📈",
  },
  {
    label: "Settings",
    path: "/settings",
    allowedRoles: ["Admin"],
    icon: "⚙️",
  },
];

function Sidebar({
  user,
}: SidebarProps) {
=======
import React from 'react';
import { NavLink } from 'react-router-dom';
>>>>>>> origin/feature/ravi

export const Sidebar: React.FC = () => {
  return (
<<<<<<< HEAD
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
            item.allowedRoles.includes(user.role),
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

=======
    <aside style={{ width: '240px', backgroundColor: '#0f172a', color: '#ffffff', minHeight: '100vh', padding: '20px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px', color: '#38bdf8' }}>Workforce HR</h2>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <NavLink 
          to="/hr/dashboard" 
          style={({ isActive }) => ({ color: isActive ? '#38bdf8' : '#94a3b8', textDecoration: 'none', fontWeight: '600', padding: '8px 12px', borderRadius: '6px' })}
        >
          📋 Dashboard
        </NavLink>
        <NavLink 
          to="/hr/employees" 
          style={({ isActive }) => ({ color: isActive ? '#38bdf8' : '#94a3b8', textDecoration: 'none', fontWeight: '600', padding: '8px 12px', borderRadius: '6px' })}
        >
          👥 Employees
        </NavLink>
        <NavLink 
          to="/hr/recruitment" 
          style={({ isActive }) => ({ color: isActive ? '#38bdf8' : '#94a3b8', textDecoration: 'none', fontWeight: '600', padding: '8px 12px', borderRadius: '6px' })}
        >
          💼 Recruitment
        </NavLink>
        <NavLink 
          to="/hr/attendance" 
          style={({ isActive }) => ({ color: isActive ? '#38bdf8' : '#94a3b8', textDecoration: 'none', fontWeight: '600', padding: '8px 12px', borderRadius: '6px' })}
        >
          ⏰ Attendance
        </NavLink>
        <NavLink 
          to="/hr/leave" 
          style={({ isActive }) => ({ color: isActive ? '#38bdf8' : '#94a3b8', textDecoration: 'none', fontWeight: '600', padding: '8px 12px', borderRadius: '6px' })}
        >
          🌴 Leave Workflow
        </NavLink>
        <NavLink 
          to="/hr/performance" 
          style={({ isActive }) => ({ color: isActive ? '#38bdf8' : '#94a3b8', textDecoration: 'none', fontWeight: '600', padding: '8px 12px', borderRadius: '6px' })}
        >
          ⭐ Performance
        </NavLink>
        <NavLink 
          to="/hr/analytics" 
          style={({ isActive }) => ({ color: isActive ? '#38bdf8' : '#94a3b8', textDecoration: 'none', fontWeight: '600', padding: '8px 12px', borderRadius: '6px' })}
        >
          📈 HR Analytics
        </NavLink>
>>>>>>> origin/feature/ravi
      </nav>
    </aside>
  );
};

export default Sidebar;