

import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import type { RootState } from "../redux/store";

import ProtectedRoute from "../components/ProtectedRoute";
import ManagerLayout from "../manager/layouts/ManagerLayout";

import Login from "../pages/Login/Login";
import NotFound from "../pages/NotFound";

// Manager Pages
import ManagerDashboard from "../manager/pages/ManagerDashboard";
import Team from "../manager/pages/Team";
import Attendance from "../manager/pages/Attendance";
import LeaveRequests from "../manager/pages/LeaveRequests";
import Performance from "../manager/pages/Performance";
import Analytics from "../manager/pages/Analytics";

const AppRoutes = () => {
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  return (
    <Routes>
      {/* Default */}
      <Route
        path="/"
        element={
          <Navigate
            to={
              isAuthenticated
                ? "/manager/dashboard"
                : "/login"
            }
            replace
          />
        }
      />

      {/* Login */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate
              to="/manager/dashboard"
              replace
            />
          ) : (
            <Login />
          )
        }
      />

      {/* Manager Routes */}
       {/* <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >  */}
      <Route
  element={
    <ProtectedRoute>
      <ManagerLayout />
    </ProtectedRoute>
  }
>
      


        <Route
          path="/manager/dashboard"
          element={<ManagerDashboard />}
        />

        <Route
          path="/manager/team"
          element={<Team />}
        />

        <Route
          path="/manager/attendance"
          element={<Attendance />}
        />

        <Route
          path="/manager/leave-requests"
          element={<LeaveRequests />}
        />

        <Route
          path="/manager/performance"
          element={<Performance />}
        />

        <Route
          path="/manager/analytics"
          element={<Analytics />}
        />
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