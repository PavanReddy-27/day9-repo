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
  updateSession,
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

  return response;
};

const users: MockUser[] = [
  {
    id: "1",
    employeeId: "EMP-001",
    username: "admin",
    password: "admin123",
    firstName: "System",
    lastName: "Administrator",
    fullName: "System Administrator",
    email: "admin@company.com",
    role: "Admin",
    department: "IT",
    designation: "System Administrator",
    location: "New York",
    avatar: "",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    id: "2",
    employeeId: "EMP-002",
    username: "hr",
    password: "hr123",
    firstName: "David",
    lastName: "Miller",
    fullName: "David Miller",
    email: "hr@company.com",
    role: "HR",
    department: "Human Resources",
    designation: "HR Manager",
    location: "Chicago",
    avatar: "",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    id: "3",
    employeeId: "EMP-003",
    username: "manager",
    password: "manager123",
    firstName: "Robert",
    lastName: "King",
    fullName: "Robert King",
    email: "manager@company.com",
    role: "Manager",
    department: "Engineering",
    designation: "Engineering Manager",
    location: "Austin",
    avatar: "",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class AuthApi {
  async login(
    payload: LoginRequest
  ): Promise<LoginResponse> {
    await new Promise((resolve) =>
      setTimeout(resolve, 700)
    );

    const user = users.find(
      (item) =>
        item.username.toLowerCase() ===
          payload.username.trim().toLowerCase() &&
        item.password === payload.password
    );

    if (!user) {
      throw new Error(
        "Invalid username or password."
      );
    }

    const { ...authUser } = user;

    auditService.log(authUser.username, authUser.role, "User Login Successful");

    return createLoginResponse(
      authUser,
      payload.rememberMe ?? false
    );
  }

  logout(): void {
    const user = this.getCurrentUser();
    if (user) {
      auditService.log(user.username, user.role, "User Logout");
    }
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

    const accessToken =
      generateToken();

    updateSession((currentSession) => ({
      ...currentSession,
      accessToken,
      expiresAt: Date.now() + ACCESS_TOKEN_EXPIRY,
    }));

    return accessToken;
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