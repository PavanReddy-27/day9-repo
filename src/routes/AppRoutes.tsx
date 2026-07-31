// ====================================
// File: src/routes/AppRoutes.tsx
// ====================================

import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAppSelector } from "../hooks/redux";

import ProtectedRoute from "../components/ProtectedRoute";

import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/Login/Login";

import Employees from "../pages/Employees";
import Analytics from "../pages/Analytics";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import AdminDashboard from "../pages/Admin/Dashboard";
import HRDashboard from "../pages/HR/Dashboard";
import ManagerDashboard from "../pages/Manager/Dashboard";

import Unauthorized from "../pages/Unauthorized/Unauthorized";
import SessionExpired from "../pages/SessionExpired/SessionExpired";
import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  const {
    isAuthenticated,
    user,
  } = useAppSelector(
    (state) => state.auth
  );

  const getDashboardRoute = () => {
    if (!user) {
      return "/login";
    }

    switch (user.role) {
      case "Admin":
        return "/admin/dashboard";

      case "HR":
        return "/hr/dashboard";

      case "Manager":
        return "/manager/dashboard";

      default:
        return "/login";
    }
  };

  return (
    <Routes>
      {/* Root */}

      <Route
        path="/"
        element={
          <Navigate
            replace
            to={
              isAuthenticated
                ? getDashboardRoute()
                : "/login"
            }
          />
        }
      />

      {/* Login */}

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate
              replace
              to={getDashboardRoute()}
            />
          ) : (
            <Login />
          )
        }
      />

      {/* Unauthorized */}

      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />

      {/* Session Expired */}

      <Route
        path="/session-expired"
        element={
          <SessionExpired />
        }
      />

      {/* ===========================
          ADMIN
      ============================ */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "Admin",
            ]}
          />
        }
      >
        <Route
          element={<DashboardLayout />}
        >
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/employees"
            element={<Employees />}
          />

          <Route
            path="/admin/analytics"
            element={<Analytics />}
          />

          <Route
            path="/admin/reports"
            element={<Reports />}
          />

          <Route
            path="/admin/settings"
            element={<Settings />}
          />
        </Route>
      </Route>

      {/* ===========================
          HR
      ============================ */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "Admin",
              "HR",
            ]}
          />
        }
      >
        <Route
          element={<DashboardLayout />}
        >
          <Route
            path="/hr/dashboard"
            element={<HRDashboard />}
          />

          <Route
            path="/hr/employees"
            element={<Employees />}
          />

          <Route
            path="/hr/analytics"
            element={<Analytics />}
          />

          <Route
            path="/hr/reports"
            element={<Reports />}
          />
        </Route>
      </Route>

      {/* ===========================
          MANAGER
      ============================ */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "Admin",
              "Manager",
            ]}
          />
        }
      >
        <Route
          element={<DashboardLayout />}
        >
          <Route
            path="/manager/dashboard"
            element={<ManagerDashboard />}
          />

          <Route
            path="/manager/employees"
            element={<Employees />}
          />

          <Route
            path="/manager/reports"
            element={<Reports />}
          />
        </Route>
      </Route>

      {/* 404 */}

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
};

export default AppRoutes;