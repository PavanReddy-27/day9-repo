// ====================================
// File: src/components/common/PermissionGate.tsx
// ====================================

import type { ReactNode } from "react";

import usePermissions from "../../hooks/usePermissions";

type PermissionKey =
  | "canAccessDashboard"
  | "canManageEmployees"
  | "canViewAnalytics"
  | "canViewReports"
  | "canAccessSettings"
  | "canManageUsers"
  | "canManageRoles"
  | "canExportReports"
  | "canApproveLeave"
  | "canEditProfile";

interface PermissionGateProps {
  permission: PermissionKey;
  children: ReactNode;
  fallback?: ReactNode;
}

const PermissionGate = ({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) => {
  const permissions = usePermissions();

  if (!permissions[permission]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGate;