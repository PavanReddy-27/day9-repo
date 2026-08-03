import { Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import Login from "../pages/Login/Login";
import Unauthorized from "../pages/Unauthorized/Unauthorized";
import SessionExpired from "../pages/SessionExpired/SessionExpired";
import NotFound from "../pages/NotFound";

// Admin Pages
import AdminDashboard from "../pages/Admin/Dashboard";
import Employees from "../pages/Employees"; // Acts as Users
import AdminRoles from "../pages/Admin/Roles"; // Dummy stub, keeping it if they don't have a real one
import Workforce from "../pages/Workforce"; // Acts as Departments
import Reports from "../pages/Reports"; // The real Reports page
import AdminAuditLogs from "../pages/Admin/AuditLogs"; // Dummy stub
import Settings from "../pages/Settings"; // The real Settings page

// HR Pages
import HRDashboard from "../pages/HR/Dashboard";
import HREmployees from "../pages/HR/Employees";
import HRRecruitment from "../pages/HR/Recruitment";
import HRAttendance from "../pages/HR/Attendance";
import HRLeaveRequests from "../pages/HR/LeaveRequests";
import HRPerformance from "../pages/HR/Performance";
import HRAnalytics from "../pages/HR/Analytics";
import HRReports from "../pages/HR/Reports";

// Manager Pages
import ManagerDashboard from "../manager/pages/ManagerDashboard";
import ManagerTeam from "../manager/pages/Team";
import ManagerAttendance from "../manager/pages/Attendance";
import ManagerLeaveRequests from "../manager/pages/LeaveRequests";
import ManagerPerformance from "../manager/pages/Performance";
import ManagerAnalytics from "../manager/pages/Analytics";

const AppRoutes = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const getDashboardRoute = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "Admin": return "/admin/dashboard";
      case "HR": return "/hr/dashboard";
      case "Manager": return "/manager/dashboard";
      default: return "/login";
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate replace to={isAuthenticated ? getDashboardRoute() : "/login"} />} />
      <Route path="/login" element={isAuthenticated ? <Navigate replace to={getDashboardRoute()} /> : <Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/session-expired" element={<SessionExpired />} />

      {/* ADMIN ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<Employees />} />
          <Route path="/admin/roles" element={<AdminRoles />} />
          <Route path="/admin/departments" element={<Workforce />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* HR ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={["HR"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/hr/dashboard" element={<HRDashboard />} />
          <Route path="/hr/employees" element={<HREmployees />} />
          <Route path="/hr/recruitment" element={<HRRecruitment />} />
          <Route path="/hr/attendance" element={<HRAttendance />} />
          <Route path="/hr/leave-requests" element={<HRLeaveRequests />} />
          <Route path="/hr/performance" element={<HRPerformance />} />
          <Route path="/hr/analytics" element={<HRAnalytics />} />
          <Route path="/hr/reports" element={<HRReports />} />
        </Route>
      </Route>

      {/* MANAGER ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={["Manager"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/manager/team" element={<ManagerTeam />} />
          <Route path="/manager/attendance" element={<ManagerAttendance />} />
          <Route path="/manager/leave-requests" element={<ManagerLeaveRequests />} />
          <Route path="/manager/performance" element={<ManagerPerformance />} />
          <Route path="/manager/analytics" element={<ManagerAnalytics />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;