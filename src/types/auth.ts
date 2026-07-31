<<<<<<< HEAD
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
=======
export type UserRole = 'Admin' | 'HR' | 'Manager' | 'admin' | 'hr' | 'manager' | 'analyst';

// Alias for modules expecting Role
export type Role = UserRole;

export interface User {
  id: string;
  name: string;
  email?: string; // Optional so missing email doesn't fail TS2741
  role: UserRole;
  department?: string;
>>>>>>> origin/feature/ravi
}

export interface AuthState {
  user: User | null;
<<<<<<< HEAD
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
=======
  token: string | null;
  isAuthenticated: boolean;
}

export type Permission =
  | 'view_dashboard'
  | 'manage_employees'
  | 'manage_recruitment'
  | 'approve_leaves'
  | 'view_analytics'
  | 'admin_settings'
  | string;
>>>>>>> origin/feature/ravi
