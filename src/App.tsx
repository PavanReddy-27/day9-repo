import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HRLayout from './layouts/HRLayout';

// Import HR Pages
import HRDashboard from './pages/hr/HRDashboard';
import HREmployees from './pages/hr/HREmployees';
import HRRecruitment from './pages/hr/HRRecruitment';
import HRAttendance from './pages/hr/HRAttendance';
import HRLeave from './pages/hr/HRLeave';
import HRPerformance from './pages/hr/HRPerformance';
import HRAnalytics from './pages/hr/HRAnalytics';

import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* HR Module Layout with Sidebar */}
      <Route
        path="/hr"
        element={
          <ProtectedRoute allowedRoles={['HR']}>
            <HRLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/hr/dashboard" replace />} />
        <Route path="dashboard" element={<HRDashboard />} />
        <Route path="employees" element={<HREmployees />} />
        <Route path="recruitment" element={<HRRecruitment />} />
        <Route path="attendance" element={<HRAttendance />} />
        <Route path="leave" element={<HRLeave />} />
        <Route path="performance" element={<HRPerformance />} />
        <Route path="analytics" element={<HRAnalytics />} />
      </Route>

      {/* Default fallback redirect */}
      <Route path="*" element={<Navigate to="/hr/dashboard" replace />} />
    </Routes>
  );
}