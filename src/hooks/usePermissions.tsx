// ====================================
// File: src/hooks/usePermissions.ts
// ====================================

import { useMemo } from "react";

import { useAppSelector } from "./redux";

import {
  canAccessDashboard,
  canManageEmployees,
  canViewAnalytics,
  canViewReports,
  canAccessSettings,
  canManageUsers,
  canManageRoles,
  canExportReports,
  canApproveLeave,
  canEditProfile,
  isAdmin,
  isHR,
  isManager,
} from "../utils/permissions";

const usePermissions = () => {
  const { user } = useAppSelector(
    (state) => state.auth
  );

  return useMemo(() => {
    if (!user) {
      return {
        role: null,

        canAccessDashboard: false,
        canManageEmployees: false,
        canViewAnalytics: false,
        canViewReports: false,
        canAccessSettings: false,
        canManageUsers: false,
        canManageRoles: false,
        canExportReports: false,
        canApproveLeave: false,
        canEditProfile: false,

        isAdmin: false,
        isHR: false,
        isManager: false,
      };
    }

    return {
      role: user.role,

      canAccessDashboard: canAccessDashboard(
        user.role
      ),

      canManageEmployees:
        canManageEmployees(user.role),

      canViewAnalytics:
        canViewAnalytics(),

      canViewReports:
        canViewReports(),

      canAccessSettings:
        canAccessSettings(user.role),

      canManageUsers:
        canManageUsers(user.role),

      canManageRoles:
        canManageRoles(user.role),

      canExportReports:
        canExportReports(),

      canApproveLeave:
        canApproveLeave(user.role),

      canEditProfile:
        canEditProfile(),

      isAdmin: isAdmin(user.role),
      isHR: isHR(user.role),
      isManager: isManager(user.role),
    };
  }, [user]);
};

export default usePermissions;