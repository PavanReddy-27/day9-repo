import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

import Dashboard from "../pages/Dashboard";
import Employees from "../pages/Employees";
import Analytics from "../pages/Analytics";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  return (
    
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    
  );
};

export default AppRoutes;