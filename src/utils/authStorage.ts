// src/utils/authStorage.ts

import type { AuthSession } from "../types/auth";

/**
 * ==========================================
 * Workforce Analytics Dashboard
 * Authentication Storage Utility
 * ==========================================
 */

const LOCAL_STORAGE_KEY = "workforce_auth";
const SESSION_STORAGE_KEY = "workforce_session";

/**
 * Save authentication session.
 * Uses localStorage if rememberMe is enabled,
 * otherwise sessionStorage.
 */
export const saveSession = (session: AuthSession): void => {
  try {
    const safeSession = {
      ...session,
      accessToken: undefined,
      refreshToken: undefined,
    };
    const serialized = JSON.stringify(safeSession);

    if (session.rememberMe) {
      localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Failed to save auth session.", error);
  }
};

/**
 * Retrieve stored session.
 */
export const getSession = (): AuthSession | null => {
  try {
    const stored =
      localStorage.getItem(LOCAL_STORAGE_KEY) ??
      sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (!stored) return null;

    const session: AuthSession = JSON.parse(stored);

    if (isSessionExpired(session)) {
      clearSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error("Failed to load auth session.", error);
    clearSession();
    return null;
  }
};

/**
 * Clear authentication session.
 */
export const clearSession = (): void => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
};

/**
 * Check whether session is expired.
 */
export const isSessionExpired = (
  session: AuthSession
): boolean => {
  return Date.now() >= session.expiresAt;
};

/**
 * Returns remaining session time.
 */
export const getRemainingSessionTime = (
  session: AuthSession
): number => {
  return Math.max(session.expiresAt - Date.now(), 0);
};

/**
 * Refresh session expiry.
 *
 * Example:
 * refreshSession(session, 60)
 * -> Extends session by 60 minutes.
 */
export const refreshSession = (
  session: AuthSession,
  durationInMinutes = 60
): AuthSession => {
  const updated: AuthSession = {
    ...session,
    expiresAt:
      Date.now() + durationInMinutes * 60 * 1000,
  };

  saveSession(updated);

  return updated;
};

/**
 * Determine whether user is authenticated.
 */
export const isAuthenticated = (): boolean => {
  const session = getSession();

  if (!session) {
    return false;
  }

  return !isSessionExpired(session);
};

/**
 * Get logged-in user.
 */
export const getCurrentUser = () => {
  return getSession()?.user ?? null;
};

/**
 * Get logged-in role.
 */
export const getCurrentRole = () => {
  return getSession()?.user.role ?? null;
};

/**
 * Get access token.
 */
export const getAccessToken = (): string | null => {
  return getSession()?.accessToken ?? null;
};

/**
 * Get refresh token.
 */
export const getRefreshToken = (): string | null => {
  return getSession()?.refreshToken ?? null;
};

/**
 * Replace the current session.
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
 * Extend active session.
 */
export const extendSession = (
  durationInMinutes = 60
): void => {
  updateSession((session) => ({
    ...session,
    expiresAt:
      Date.now() + durationInMinutes * 60 * 1000,
  }));
};