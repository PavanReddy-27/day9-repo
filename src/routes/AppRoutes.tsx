import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

import Home from "../pages/Home";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard";
import Workforce from "../pages/Workforce";
import Employees from "../pages/Employees";
import Analytics from "../pages/Analytics";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import Profile from "../pages/Profile";
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workforce" element={<Workforce />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}