// ====================================
// File: src/routes/ProtectedRoute.tsx
// ====================================

import { Navigate, Outlet } from "react-router-dom";

import { useAppSelector } from "../hooks/redux";
import authApi from "../services/authApi";

import type { UserRole } from "../types/auth";
import { simulateBackendChecks, BackendSimulationError } from "../services/backendSimulation";
import auditService from "../services/auditService";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({
  allowedRoles,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAppSelector(
    (state) => state.auth
  );

  /**
   * User not logged in
   */
  if (
    !isAuthenticated ||
    !user ||
    !authApi.isAuthenticated()
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /**
   * Session Expired
   */
  const accessToken = authApi.getAccessToken();

  if (!accessToken) {
    authApi.logout();

    return (
      <Navigate
        to="/session-expired"
        replace
      />
    );
  }

  /**
   * Role Authorization
   */
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    auditService.log(user.username, user.role, `Access Denied: Attempted to access restricted route`);
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  /**
   * Simulated Backend Architecture Checks
   */
  try {
    // We pass a dummy resource and department for simulation purposes.
    // In a real app, this would happen in an axios interceptor on API calls.
    simulateBackendChecks("route_access", "read");
  } catch (error) {
    if (error instanceof BackendSimulationError && error.status === 403) {
      auditService.log(user.username, user.role, `Access Denied: Backend Simulation Check Failed`);
      return (
        <Navigate
          to="/unauthorized"
          replace
        />
      );
    }
  }

  /**
   * Render Protected Route
   */
  return <Outlet />;
};

export default ProtectedRoute;