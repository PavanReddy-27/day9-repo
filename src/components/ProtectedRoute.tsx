// ====================================
// File: src/routes/ProtectedRoute.tsx
// ====================================

import { Navigate, Outlet } from "react-router-dom";

import { useAppSelector } from "../hooks/redux";
import authApi from "../services/authApi";

import type { UserRole } from "../types/auth";

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
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  /**
   * Render Protected Route
   */
  return <Outlet />;
};

export default ProtectedRoute;