// ====================================
// File: src/routes/AppRoutes.tsx
// ====================================

import React, { Suspense } from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAppSelector } from "../hooks/redux";

import ProtectedRoute from "../components/ProtectedRoute";

import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/Login/Login";

// Route-Based Code Splitting (Task 16 - Pavan Kumar)
// Heavy role-based views are lazy-loaded dynamically on demand
const AdminDashboard = React.lazy(() => import("../pages/admin/Dashboard"));
const AdminUsers = React.lazy(() => import("../pages/admin/Users"));
const AdminRoles = React.lazy(() => import("../pages/admin/Roles"));
const AdminDepartments = React.lazy(() => import("../pages/admin/Departments"));
const AdminReports = React.lazy(() => import("../pages/admin/Reports"));
const AdminAuditLogs = React.lazy(() => import("../pages/admin/AuditLogs"));
const AdminMonitoring = React.lazy(() => import("../pages/admin/MonitoringDashboard"));
const AdminSystemHealth = React.lazy(() => import("../pages/admin/SystemHealth/SystemHealth"));
const Settings = React.lazy(() => import("../pages/Settings"));

// HR Pages
const HRDashboard = React.lazy(() => import("../pages/HR/Dashboard"));
const HREmployees = React.lazy(() => import("../pages/HR/Employees"));
const HRRecruitment = React.lazy(() => import("../pages/HR/Recruitment"));
const HRAttendance = React.lazy(() => import("../pages/HR/Attendance"));
const HRPerformance = React.lazy(() => import("../pages/HR/Performance"));
const HRAnalytics = React.lazy(() => import("../pages/HR/Analytics"));

// Manager Pages
const ManagerDashboard = React.lazy(() => import("../manager/pages/ManagerDashboard"));
const ManagerTeam = React.lazy(() => import("../manager/pages/Team"));
const ManagerPerformance = React.lazy(() => import("../manager/pages/Performance"));
const ManagerAnalytics = React.lazy(() => import("../manager/pages/Analytics"));

// Shared Pages
const SharedLeaveRequests = React.lazy(() => import("../pages/shared/LeaveRequests/LeaveRequests"));
const SharedPayroll = React.lazy(() => import("../pages/shared/Payroll/Payroll"));

// Employee Pages
const EmployeeDashboard = React.lazy(() => import("../pages/Employee/Dashboard"));
const EmployeeAttendance = React.lazy(() => import("../pages/Employee/Attendance"));
const EmployeeLeaveRequests = React.lazy(() => import("../pages/Employee/LeaveRequests"));
const EmployeeMyPay = React.lazy(() => import("../pages/Employee/MyPay"));

// Error Pages
const Unauthorized = React.lazy(() => import("../pages/Unauthorized/Unauthorized"));
const SessionExpired = React.lazy(() => import("../pages/SessionExpired/SessionExpired"));
const NotFound = React.lazy(() => import("../pages/NotFound"));

/**
 * Accessible route loading fallback compliant with WCAG 2.1 AA
 */
const RouteLoadingFallback = () => (
  <div
    role="status"
    aria-live="polite"
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      gap: "1rem",
      color: "var(--text-light, #64748b)",
    }}
  >
    <div
      style={{
        width: "38px",
        height: "38px",
        border: "3px solid rgba(59, 130, 246, 0.2)",
        borderTopColor: "var(--primary, #3b82f6)",
        borderRadius: "50%",
        animation: "spin 0.75s linear infinite",
      }}
    />
    <span style={{ fontSize: "0.875rem", fontWeight: 500, letterSpacing: "0.02em" }}>
      Loading workspace view...
    </span>
  </div>
);

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


      case "Employee":
        return "/employee/dashboard";

      default:
        return "/login";
    }
  };

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
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
            path="/admin/monitoring"
            element={<AdminMonitoring />}
          />

          <Route
            path="/admin/system-health"
            element={<AdminSystemHealth />}
          />

          <Route
            path="/admin/settings"
            element={<Settings />}
          />

          {/* === HR Pages for Admin === */}
          <Route
            path="/admin/analytics"
            element={<HRAnalytics />}
          />

          <Route
            path="/admin/employees"
            element={<HREmployees />}
          />

          <Route
            path="/admin/recruitment"
            element={<HRRecruitment />}
          />

          <Route
            path="/admin/attendance"
            element={<HRAttendance />}
          />

          <Route
            path="/admin/leave-requests"
            element={<SharedLeaveRequests />}
          />
          <Route path="/admin/leave" element={<Navigate to="/admin/leave-requests" replace />} />
          <Route path="/admin/leaves" element={<Navigate to="/admin/leave-requests" replace />} />

          <Route
            path="/admin/payroll"
            element={<SharedPayroll />}
          />

          <Route
            path="/admin/performance"
            element={<HRPerformance />}
          />

          {/* === Manager Pages for Admin === */}
          <Route
            path="/admin/team"
            element={<ManagerTeam />}
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
              "Admin",
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
            element={<SharedLeaveRequests />}
          />
          <Route path="/hr/leave" element={<Navigate to="/hr/leave-requests" replace />} />
          <Route path="/hr/leaves" element={<Navigate to="/hr/leave-requests" replace />} />

          <Route
            path="/hr/payroll"
            element={<SharedPayroll />}
          />

          <Route
            path="/hr/performance"
            element={<HRPerformance />}
          />

          <Route
            path="/hr/analytics"
            element={<HRAnalytics />}
          />

          <Route
            path="/hr/settings"
            element={<Settings />}
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
              "Admin",
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
            element={<HRAttendance />}
          />

          <Route
            path="/manager/leave-requests"
            element={<SharedLeaveRequests />}
          />
          <Route path="/manager/leave" element={<Navigate to="/manager/leave-requests" replace />} />
          <Route path="/manager/leaves" element={<Navigate to="/manager/leave-requests" replace />} />

          <Route
            path="/manager/payroll"
            element={<SharedPayroll />}
          />

          <Route
            path="/manager/performance"
            element={<ManagerPerformance />}
          />

          <Route
            path="/manager/analytics"
            element={<ManagerAnalytics />}
          />

          <Route
            path="/manager/settings"
            element={<Settings />}
          />
        </Route>
      </Route>




      {/* ===========================
          EMPLOYEE
      ============================ */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "Employee",
              "Admin",
            ]}
          />
        }
      >
        <Route
          element={<DashboardLayout />}
        >
          <Route
            path="/employee/dashboard"
            element={<EmployeeDashboard />}
          />
          <Route
            path="/employee/attendance"
            element={<EmployeeAttendance />}
          />
          <Route
            path="/employee/leave-requests"
            element={<EmployeeLeaveRequests />}
          />
          <Route path="/employee/leave" element={<Navigate to="/employee/leave-requests" replace />} />
          <Route path="/employee/leaves" element={<Navigate to="/employee/leave-requests" replace />} />
          
          <Route
            path="/employee/payroll"
            element={<EmployeeMyPay />}
          />

          <Route
            path="/employee/settings"
            element={<Settings />}
          />
        </Route>
      </Route>

      {/* Aliases & Fallbacks */}
      <Route
        path="/settings/security"
        element={
          <Navigate
            replace
            to={
              user?.role === "HR"
                ? "/hr/settings"
                : user?.role === "Manager"
                ? "/manager/settings"
                : user?.role === "Employee"
                ? "/employee/settings"
                : "/admin/settings"
            }
          />
        }
      />

      {/* 404 */}

      <Route
        path="*"
        element={<NotFound />}
      />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;