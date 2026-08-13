// ====================================
// File: src/services/authApi.ts
// ====================================

import type {
  LoginRequest,
  LoginResponse,
  User,
  UserRole,
} from "../types/auth";

import {
  saveSession,
  clearSession,
  getSession,
} from "../utils/authStorage";

import { ROLE_DASHBOARD } from "../config/roles";
import auditService from "./auditService";



interface MockUser extends User {
  username: string;
  password: string;
}

const ACCESS_TOKEN_EXPIRY = 8 * 60 * 60 * 1000;

const generateToken = (length = 64): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
};

const createLoginResponse = (
  user: User,
  rememberMe: boolean
): LoginResponse => {
  const issuedAt = Date.now();

  const response: LoginResponse = {
    success: true,
    user,
    accessToken: generateToken(),
    refreshToken: generateToken(),
    expiresAt: issuedAt + ACCESS_TOKEN_EXPIRY,
  };

  saveSession({
    ...response,
    rememberMe,
  });

  if (response.accessToken) {
    localStorage.setItem("accessToken", response.accessToken);
  }

  return response;
};

export const mockUsers: MockUser[] = [
  {
    id: "1",
    employeeId: "DEV_ADMIN",
    username: "admin@thestackly.com",
    password: "Password123!",
    firstName: "System",
    lastName: "Admin",
    fullName: "System Admin",
    email: "admin@thestackly.com",
    role: "Admin",
    department: "IT",
    designation: "System Administrator",
    location: "Hyderabad",
    avatar: "",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    employeeId: "DEV_HR",
    username: "hr@thestackly.com",
    password: "Password123!",
    firstName: "HR",
    lastName: "Manager",
    fullName: "HR Manager",
    email: "hr@thestackly.com",
    role: "HR",
    department: "Human Resources",
    designation: "HR Lead",
    location: "Hyderabad",
    avatar: "",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    employeeId: "DEV_MANAGER",
    username: "manager@thestackly.com",
    password: "Password123!",
    firstName: "Engineering",
    lastName: "Manager",
    fullName: "Engineering Manager",
    email: "manager@thestackly.com",
    role: "Manager",
    department: "Engineering",
    designation: "Manager",
    location: "Hyderabad",
    avatar: "",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    id: "5",
    employeeId: "DEV_EMPLOYEE",
    username: "employee@thestackly.com",
    password: "Password123!",
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    email: "employee@thestackly.com",
    role: "Employee",
    department: "Engineering",
    designation: "Software Engineer",
    location: "Hyderabad",
    workMode: "Remote",
    avatar: "",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class AuthApi {
  private get ApiBase() {
    return (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL || "/api/v1";
  }

  async login(payload: LoginRequest): Promise<LoginResponse> {
    const inputEmail = payload.email ? payload.email.trim().toLowerCase() : "";
    const inputPassword = payload.password;

    try {
      const res = await fetch(`${this.ApiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          const mockMatch = mockUsers.find(
            (u) =>
              (u.email.toLowerCase() === inputEmail || u.username.toLowerCase() === inputEmail) &&
              u.password === inputPassword
          );
          if (mockMatch) {
            auditService.log(mockMatch.username, mockMatch.role, "User Login Successful (Dev Fallback)");
            return createLoginResponse(mockMatch, payload.rememberMe ?? false);
          }
          throw new Error(errorData.message || "Invalid username or password.");
        }
        throw new Error(errorData.message || `Server error (${res.status}).`);
      }

      const responseData = await res.json();
      const data: LoginResponse = {
        success: responseData.success,
        user: responseData.data,
        accessToken: responseData.data.accessToken,
        refreshToken: responseData.data.refreshToken,
        expiresAt: Date.now() + 15 * 60 * 1000,
      };

      saveSession({
        ...data,
        rememberMe: payload.rememberMe ?? false,
      });

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }

      auditService.log(data.user.username, data.user.role, "User Login Successful");
      return data;
    } catch (err: unknown) {
      const mockMatch = mockUsers.find(
        (u) =>
          (u.email.toLowerCase() === inputEmail || u.username.toLowerCase() === inputEmail) &&
          u.password === inputPassword
      );

      if (mockMatch) {
        auditService.log(mockMatch.username, mockMatch.role, "User Login Successful (Offline Dev Fallback)");
        return createLoginResponse(mockMatch, payload.rememberMe ?? false);
      }

      if (err instanceof Error && err.message !== "Invalid username or password.") {
        console.error("Backend authentication failed:", err);
      }
      throw err instanceof Error ? err : new Error("Invalid username or password.");
    }
  }

  logout(): void {
    const user = this.getCurrentUser();
    if (user) {
      auditService.log(user.username, user.role, "User Logout");
    }
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetch(`${this.ApiBase}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem("accessToken");
    clearSession();
  }

  isAuthenticated(): boolean {
    return !!getSession();
  }

  getCurrentUser(): User | null {
    const session = getSession();

    if (!session) {
      return null;
    }

    return session.user;
  }

  getRole(): UserRole | null {
    return this.getCurrentUser()?.role ?? null;
  }

  getAccessToken(): string | null {
    const session = getSession();

    return session?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    const session = getSession();

    return session?.refreshToken ?? null;
  }

  refreshAccessToken(): string | null {
    const session = getSession();

    if (!session) {
      return null;
    }

    // Removed generateToken fallback since real refresh tokens come from backend
    // This method should realistically call the backend /refresh endpoint
    return null;
  }

  hasRole(
    roles: UserRole | UserRole[]
  ): boolean {
    const currentRole =
      this.getRole();

    if (!currentRole) {
      return false;
    }

    if (Array.isArray(roles)) {
      return roles.includes(
        currentRole
      );
    }

    return currentRole === roles;
  }

  getDashboardRoute(): string {
    const role =
      this.getRole();

    if (!role) {
      return "/login";
    }

    return ROLE_DASHBOARD[role];
  }

  isAdmin(): boolean {
    return this.hasRole(
      "Admin"
    );
  }

  isHR(): boolean {
    return this.hasRole(
      "HR"
    );
  }

  isManager(): boolean {
    return this.hasRole(
      "Manager"
    );
  }
}

const authApi = new AuthApi();

export default authApi;