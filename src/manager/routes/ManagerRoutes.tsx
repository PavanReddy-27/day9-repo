import { Routes, Route, Navigate } from "react-router-dom";

import ManagerDashboard from "../pages/ManagerDashboard";
import Team from "../pages/Team";
import Attendance from "../pages/Attendance";
import SharedLeaveRequests from "../../pages/shared/LeaveRequests/LeaveRequests";
import Performance from "../pages/Performance";
import Analytics from "../pages/Analytics";

const ManagerRoutes = () => {
  return (
    <Routes>
      <Route
        index
        element={<Navigate to="dashboard" replace />}
      />

      <Route
        path="dashboard"
        element={<ManagerDashboard />}
      />

      <Route
        path="team"
        element={<Team />}
      />

      <Route
        path="attendance"
        element={<Attendance />}
      />

      <Route
        path="leave-requests"
        element={<SharedLeaveRequests />}
      />

      <Route
        path="performance"
        element={<Performance />}
      />

      <Route
        path="analytics"
        element={<Analytics />}
      />
    </Routes>
  );
};

export default ManagerRoutes;