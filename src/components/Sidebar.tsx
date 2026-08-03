import React from 'react';
import { NavLink } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  return (
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
      </nav>
    </aside>
  );
};

export default Sidebar;