import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export const HRLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
      {/* Persistent Left Sidebar */}
      <Sidebar />
      
      {/* Main Content Area where pages load */}
      <main style={{ flex: 1, backgroundColor: '#f8fafc', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default HRLayout;