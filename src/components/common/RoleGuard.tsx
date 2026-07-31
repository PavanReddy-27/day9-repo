// ====================================
// File: src/components/common/RoleGuard.tsx
// ====================================

import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAppSelector } from "../../hooks/redux";
import type { UserRole } from "../../types/auth";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

const RoleGuard = ({
  children,
  allowedRoles,
  fallbackPath = "/unauthorized",
}: RoleGuardProps) => {
  const { isAuthenticated, user } = useAppSelector(
    (state) => state.auth
  );

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const hasAccess = allowedRoles.includes(
    user.role
  );

  if (!hasAccess) {
    return (
      <Navigate
        to={fallbackPath}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default RoleGuard;