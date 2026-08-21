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

class AuthApi {
  private get ApiBase() {
    return (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL || "/api/v1";
  }

  async login(payload: LoginRequest): Promise<LoginResponse> {
    try {
      const res = await fetch(`${this.ApiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error;
        if (res.status === 401) {
          throw new Error(errorMessage || "Invalid username or password.");
        }
        throw new Error(errorMessage || `Server error (${res.status}).`);
      }

      const responseData = await res.json();
      const data = responseData.data || responseData.user || responseData;

      if (data.mfaRequired) {
        return {
          success: true,
          mfaRequired: true,
          tempToken: data.tempToken,
        };
      }

      const userData = data;
      const accessToken = data.accessToken || responseData.accessToken;
      const refreshToken = data.refreshToken || responseData.refreshToken;
      const expiresAt = data.expiresAt || responseData.expiresAt || Date.now() + 15 * 60 * 1000;

      const loginRes: LoginResponse = {
        success: true,
        user: userData,
        accessToken,
        refreshToken,
        expiresAt,
      };

      saveSession({
        user: userData,
        accessToken,
        refreshToken,
        expiresAt,
        rememberMe: payload.rememberMe ?? false,
      });

      if (loginRes.accessToken) {
        localStorage.setItem("accessToken", loginRes.accessToken);
      }

      auditService.log(userData.email, userData.role, "User Login Successful");
      return loginRes;
    } catch (err: unknown) {


      if (err instanceof Error && err.message !== "Invalid username or password.") {
        console.error("Backend authentication failed:", err);
      }
      throw err instanceof Error ? err : new Error("Invalid username or password.");
    }
  }

  async verifyLoginMfa(tempToken: string, mfaToken: string): Promise<LoginResponse> {
    const res = await fetch(`${this.ApiBase}/auth/login/mfa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tempToken, mfaToken }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Invalid MFA code.");
    }

    const responseData = await res.json();
    const data = responseData.data || responseData;

    const loginRes: LoginResponse = {
      success: true,
      user: data,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt || Date.now() + 15 * 60 * 1000,
    };

    saveSession({
      user: loginRes.user!,
      accessToken: loginRes.accessToken!,
      refreshToken: loginRes.refreshToken!,
      expiresAt: loginRes.expiresAt!,
      rememberMe: false,
    });

    if (loginRes.accessToken) {
      localStorage.setItem("accessToken", loginRes.accessToken);
    }
    
    return loginRes;
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
      }).catch(() => { });
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

  async generateMfa(): Promise<{ secret: string; qrCodeDataUrl: string }> {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${this.ApiBase}/auth/mfa/generate`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to generate MFA");
    const data = await res.json();
    return data.data;
  }

  async enableMfa(secret: string, mfaToken: string): Promise<boolean> {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${this.ApiBase}/auth/mfa/enable`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ secret, mfaToken }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to enable MFA");
    }
    return true;
  }

  async disableMfa(): Promise<boolean> {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${this.ApiBase}/auth/mfa/disable`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to disable MFA");
    return true;
  }
}

const authApi = new AuthApi();

export default authApi;