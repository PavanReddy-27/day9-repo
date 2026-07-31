// src/types/auth.ts

/**
 * ==========================================
 * Authentication & Authorization Types
 * Workforce Analytics Dashboard
 * ==========================================
 */

export type UserRole = "Admin" | "HR" | "Manager";

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
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  success: boolean;

  user: User;

  accessToken: string;

  refreshToken: string;

  expiresAt: number;
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