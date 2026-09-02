import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";
import type { UserRole } from "../types/auth";
import auditService from "../services/auditService";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  /**
   * User not logged in
   */
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  /**
   * Role Authorization
   */
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    auditService.log(user.username || user.email, user.role, "Access Denied: Attempted to access restricted route");
    return <Navigate to="/unauthorized" replace />;
  }

  /**
   * Render Protected Route
   */
  return <Outlet />;
};

export default ProtectedRoute;