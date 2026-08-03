export type UserRole = 'Admin' | 'HR' | 'Manager' | 'admin' | 'hr' | 'manager' | 'analyst';

// Alias for modules expecting Role
export type Role = UserRole;

export interface User {
  id: string;
  name: string;
  email?: string; // Optional so missing email doesn't fail TS2741
  role: UserRole;
  department?: string;
}

export interface AuthState {
  user: User | null;
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