import type { AttendancePolicyType } from "./attendance";

export type UserRole = "Admin" | "HR" | "Manager" | "Employee";

export interface User {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  department: string;
  designation: string;
  location: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /**
   * How this employee is expected to attend work. Drives attendance geofencing:
   * "Office" enforces the configured office radius on check-in/out, "Remote"/"Hybrid"
   * do not. Kept separate from `department` so team/department scoping (used for
   * manager visibility, corrections, etc.) isn't overloaded with work-location meaning.
   */
  workMode?: AttendancePolicyType;
  mfaEnabled?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  mfaRequired?: boolean;
  tempToken?: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  rememberMe: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  rememberMe: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  error: string | null;
  mfaRequired: boolean;
  tempToken: string | null;
}

export interface Permission {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  export: boolean;
}

export interface PermissionMap {
  dashboard: Permission;
  users: Permission;
  employees: Permission;
  departments: Permission;
  recruitment: Permission;
  attendance: Permission;
  leave: Permission;
  analytics: Permission;
  reports: Permission;
  settings: Permission;
  auditLogs: Permission;
}

export interface RoutePermission {
  path: string;
  roles: UserRole[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => void;
}
