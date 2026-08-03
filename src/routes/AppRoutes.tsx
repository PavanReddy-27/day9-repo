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

import AdminDashboard from "../pages/admin/Dashboard";
import AdminUsers from "../pages/admin/Users";
import AdminRoles from "../pages/admin/Roles";
import AdminDepartments from "../pages/admin/Departments";
import AdminReports from "../pages/admin/Reports";
import AdminAuditLogs from "../pages/admin/AuditLogs";
import AdminSettings from "../pages/admin/Settings";
// HR Pages
import HRDashboard from "../pages/HR/HRDashboard";
import HREmployees from "../pages/HR/HREmployees";
import HRRecruitment from "../pages/HR/HRRecruitment";
import HRAttendance from "../pages/HR/HRAttendance";
import HRLeave from "../pages/HR/HRLeave";
import HRPerformance from "../pages/HR/HRPerformance";
import HRAnalytics from "../pages/HR/HRAnalytics";

// Manager Pages
import ManagerDashboard from "../manager/pages/ManagerDashboard";
import ManagerTeam from "../manager/pages/Team";
import ManagerAttendance from "../manager/pages/Attendance";
import ManagerLeaveRequests from "../manager/pages/LeaveRequests";
import ManagerPerformance from "../manager/pages/Performance";
import ManagerAnalytics from "../manager/pages/Analytics";

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
            path="/admin/users"
            element={<AdminUsers />}
          />

          <Route
            path="/admin/roles"
            element={<AdminRoles />}
          />

          <Route
            path="/admin/departments"
            element={<AdminDepartments />}
          />

          <Route
            path="/admin/reports"
            element={<AdminReports />}
          />

          <Route
            path="/admin/audit-logs"
            element={<AdminAuditLogs />}
          />

          <Route
            path="/admin/settings"
            element={<AdminSettings />}
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
            element={<HREmployees />}
          />

          <Route
            path="/hr/recruitment"
            element={<HRRecruitment />}
          />

          <Route
            path="/hr/attendance"
            element={<HRAttendance />}
          />

          <Route
            path="/hr/leave-requests"
            element={<HRLeave />}
          />

          <Route
            path="/hr/performance"
            element={<HRPerformance />}
          />

          <Route
            path="/hr/analytics"
            element={<HRAnalytics />}
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
            path="/manager/team"
            element={<ManagerTeam />}
          />

          <Route
            path="/manager/attendance"
            element={<ManagerAttendance />}
          />

          <Route
            path="/manager/leave-requests"
            element={<ManagerLeaveRequests />}
          />

          <Route
            path="/manager/performance"
            element={<ManagerPerformance />}
          />

          <Route
            path="/manager/analytics"
            element={<ManagerAnalytics />}
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