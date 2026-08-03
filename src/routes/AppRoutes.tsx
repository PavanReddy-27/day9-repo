import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import Users from "../pages/admin/Users";
import Roles from "../pages/admin/Roles";
import Departments from "../pages/admin/Departments";
import Reports from "../pages/admin/Reports";
import AuditLogs from "../pages/admin/AuditLogs";
import Settings from "../pages/admin/Settings";
import Login from "../pages/Login/Login";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Default Route */}

      <Route
        path="/"
        element={<Navigate to="/admin/dashboard" replace />}
      />

      {/* Admin Routes */}

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="roles" element={<Roles />} />
        <Route path="departments" element={<Departments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Optional Login Route */}

      <Route
        path="/login"
        element={<Login />}
      />

      {/* Not Found */}

      <Route
        path="*"
        element={<Navigate to="/admin/dashboard" replace />}
      />
    </Routes>
  );
};

export default AppRoutes;