// src/utils/authStorage.ts

import type { AuthSession } from "../types/auth";

/**
 * ==========================================
 * Workforce Analytics Dashboard
 * In-Memory Authentication Session Utility
 *
 * In accordance with Phase 12 production security:
 * - Access tokens and refresh tokens are NEVER stored in localStorage or sessionStorage.
 * - Authenticated session state resides solely in application memory.
 * - HTTP-only cookies are the authoritative credential for backend requests.
 * ==========================================
 */

let inMemorySession: AuthSession | null = null;

/**
 * Save authentication session in application memory.
 * Does NOT persist sensitive tokens to browser localStorage or sessionStorage.
 */
export const saveSession = (session: AuthSession): void => {
  inMemorySession = { ...session };
  // Proactively purge any obsolete tokens that might have been stored in previous versions
  try {
    localStorage.removeItem("workforce_auth");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("workforce_session");
  } catch {
    // Storage access may be restricted
  }
};

/**
 * Retrieve active session from application memory.
 */
export const getSession = (): AuthSession | null => {
  if (!inMemorySession) return null;

  if (isSessionExpired(inMemorySession)) {
    clearSession();
    return null;
  }

  return inMemorySession;
};

/**
 * Clear authentication session from application memory.
 */
export const clearSession = (): void => {
  inMemorySession = null;
  try {
    localStorage.removeItem("workforce_auth");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("workforce_session");
  } catch {
    // Storage access may be restricted
  }
};

/**
 * Check whether session is expired.
 */
export const isSessionExpired = (session: AuthSession): boolean => {
  return Date.now() >= session.expiresAt;
};

/**
 * Returns remaining session time.
 */
export const getRemainingSessionTime = (session: AuthSession): number => {
  return Math.max(session.expiresAt - Date.now(), 0);
};

/**
 * Refresh session expiry in memory.
 */
export const refreshSession = (
  session: AuthSession,
  durationInMinutes = 60
): AuthSession => {
  const updated: AuthSession = {
    ...session,
    expiresAt: Date.now() + durationInMinutes * 60 * 1000,
  };

  saveSession(updated);
  return updated;
};

/**
 * Determine whether user is authenticated in memory.
 */
export const isAuthenticated = (): boolean => {
  const session = getSession();
  if (!session) return false;
  return !isSessionExpired(session);
};

/**
 * Get logged-in user from in-memory session.
 */
export const getCurrentUser = () => {
  return getSession()?.user ?? null;
};

/**
 * Get logged-in role from in-memory session.
 */
export const getCurrentRole = () => {
  return getSession()?.user?.role ?? null;
};

/**
 * Get access token from in-memory session.
 */
export const getAccessToken = (): string | null => {
  return getSession()?.accessToken ?? null;
};

/**
 * Get refresh token from in-memory session.
 */
export const getRefreshToken = (): string | null => {
  return getSession()?.refreshToken ?? null;
};

/**
 * Replace the current in-memory session.
 */
export const updateSession = (
  updater: (session: AuthSession) => AuthSession
): void => {
  const current = getSession();
  if (!current) return;
  const updated = updater(current);
  saveSession(updated);
};

/**
 * Extend active in-memory session.
 */
export const extendSession = (durationInMinutes = 60): void => {
  updateSession((session) => ({
    ...session,
    expiresAt: Date.now() + durationInMinutes * 60 * 1000,
  }));
};