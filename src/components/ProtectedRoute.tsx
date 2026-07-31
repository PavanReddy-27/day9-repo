<<<<<<< HEAD
﻿// ====================================
// File: src/routes/ProtectedRoute.tsx
// ====================================

import { Navigate, Outlet } from "react-router-dom";

import { useAppSelector } from "../hooks/redux";
=======
﻿import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: string;
  allowedRoles?: string[];
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role, allowedRoles, requiredRole }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
>>>>>>> origin/feature/ravi

import authApi from "../services/authApi";

import type { UserRole } from "../types/auth";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({
  allowedRoles,
}: ProtectedRouteProps) => {
  const {
    isAuthenticated,
    user,
  } = useAppSelector(
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

<<<<<<< HEAD
  /**
   * Session Expired
   */
  const accessToken =
    authApi.getAccessToken();

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
    !allowedRoles.includes(
      user.role
    )
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
=======
  const userRole = user?.role;
  const targetRole = role || requiredRole;

  if (targetRole && userRole !== targetRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
>>>>>>> origin/feature/ravi
};

export default ProtectedRoute;