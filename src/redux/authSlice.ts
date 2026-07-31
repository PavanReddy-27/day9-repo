import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../types/auth';

<<<<<<< HEAD
import type {
  AuthState,
  AuthSession,
  LoginResponse,
  UserRole,
} from "../types/auth";

import {
  saveSession,
  getSession,
  clearSession,
  isSessionExpired,
} from "../utils/authStorage";

/* ============================================================
   Constants
============================================================ */

const SESSION_DURATION = 60 * 60 * 1000; // 1 Hour

/* ============================================================
   Helper Functions
============================================================ */

/**
 * Creates a complete authentication session
 * from the login response.
 */
const createSession = (
  response: LoginResponse,
  rememberMe: boolean
): AuthSession => ({
  user: response.user,

  accessToken: response.accessToken,

  refreshToken: response.refreshToken,

  expiresAt:
    response.expiresAt ||
    Date.now() + SESSION_DURATION,

  rememberMe,
});

/**
 * Converts a session into Redux state.
 */
const createStateFromSession = (
  session: AuthSession
): AuthState => ({
  user: session.user,

  accessToken: session.accessToken,

  refreshToken: session.refreshToken,

  expiresAt: session.expiresAt,

  rememberMe: session.rememberMe,

  isAuthenticated: true,

  isLoading: false,

  initialized: true,

  error: null,
});

/**
 * Default authentication state.
 */
const createInitialState = (): AuthState => ({
  user: null,

  accessToken: null,

  refreshToken: null,

  expiresAt: null,

  rememberMe: false,

  isAuthenticated: false,

  isLoading: false,

  initialized: false,

  error: null,
});

/* ============================================================
   Restore Previous Session
============================================================ */

const restoreSession = (): AuthState => {
  const session = getSession();

  if (!session) {
    return {
      ...createInitialState(),
      initialized: true,
    };
  }

  if (isSessionExpired(session)) {
    clearSession();

    return {
      ...createInitialState(),
      initialized: true,
    };
  }

  return createStateFromSession(session);
};

/* ============================================================
   Initial State
============================================================ */

const initialState: AuthState = restoreSession();
/* ============================================================
   Auth Slice
============================================================ */

const authSlice = createSlice({
  name: "auth",

=======
const initialState: AuthState = {
  user: {
    id: 'emp-101',
    name: 'Sarah Jenkins',
    email: 'sarah.j@company.com',
    role: 'HR',
    department: 'Human Resources',
  },
  token: 'mock-jwt-token-12345',
  isAuthenticated: true,
};

export const authSlice = createSlice({
  name: 'auth',
>>>>>>> origin/feature/ravi
  initialState,

  reducers: {
<<<<<<< HEAD
    /* ===========================
       Loading
    ============================ */

    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },

    /* ===========================
       Login Success
    ============================ */

    loginSuccess(
      state,
      action: PayloadAction<{
        response: LoginResponse;
        rememberMe: boolean;
      }>
    ) {
      const { response, rememberMe } = action.payload;

      const session = createSession(
        response,
        rememberMe
      );

      saveSession(session);

      state.user = session.user;

      state.accessToken =
        session.accessToken;

      state.refreshToken =
        session.refreshToken;

      state.expiresAt =
        session.expiresAt;

      state.rememberMe =
        session.rememberMe;

      state.isAuthenticated = true;

      state.isLoading = false;

      state.initialized = true;

      state.error = null;
    },

    /* ===========================
       Login Failed
    ============================ */

    loginFailure(
      state,
      action: PayloadAction<string>
    ) {
      state.user = null;

      state.accessToken = null;

      state.refreshToken = null;

      state.expiresAt = null;

      state.rememberMe = false;

      state.isAuthenticated = false;

      state.isLoading = false;

      state.initialized = true;

      state.error = action.payload;

      clearSession();
    },

    /* ===========================
       Restore Existing Session
    ============================ */

    restoreAuth(state) {
      const session = getSession();

      if (!session) {
        Object.assign(
          state,
          createInitialState(),
          {
            initialized: true,
          }
        );

        return;
      }

      if (isSessionExpired(session)) {
        clearSession();

        Object.assign(
          state,
          createInitialState(),
          {
            initialized: true,
          }
        );

        return;
      }

      Object.assign(
        state,
        createStateFromSession(session)
      );
    },

    /* ===========================
       Logout
    ============================ */

    logout(state) {
      clearSession();

      Object.assign(
        state,
        createInitialState(),
        {
          initialized: true,
        }
      );
    },

    /* ===========================
       Clear Error
    ============================ */

    clearError(state) {
      state.error = null;
    },

    /* ===========================
       Update Remember Me
    ============================ */

    updateRememberMe(
      state,
      action: PayloadAction<boolean>
    ) {
      state.rememberMe =
        action.payload;

      const session = getSession();

      if (!session) return;

      saveSession({
        ...session,
        rememberMe: action.payload,
      });
    },

    /* ===========================
       Refresh Tokens
    ============================ */

    updateTokens(
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        expiresAt: number;
      }>
    ) {
      state.accessToken =
        action.payload.accessToken;

      state.refreshToken =
        action.payload.refreshToken;

      state.expiresAt =
        action.payload.expiresAt;

      const session = getSession();

      if (!session) return;

      saveSession({
        ...session,
        accessToken:
          action.payload.accessToken,

        refreshToken:
          action.payload.refreshToken,

        expiresAt:
          action.payload.expiresAt,
      });
    },

    /* ===========================
       Session Expired
    ============================ */

    sessionExpired(state) {
      clearSession();

      Object.assign(
        state,
        createInitialState(),
        {
          initialized: true,
          error:
            "Your session has expired. Please login again.",
        }
      );
=======
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
>>>>>>> origin/feature/ravi
    },
  },
});
/* ============================================================
   Actions
============================================================ */

<<<<<<< HEAD
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  restoreAuth,
  logout,
  clearError,
  updateRememberMe,
  updateTokens,
  sessionExpired,
} = authSlice.actions;

/* ============================================================
   RootState Type Import
============================================================ */

import type { RootState } from "./store";

/* ============================================================
   Basic Selectors
============================================================ */

export const selectAuth = (state: RootState) => state.auth;

export const selectUser = (state: RootState) =>
  state.auth.user;

export const selectRole = (state: RootState) =>
  state.auth.user?.role ?? null;

export const selectAccessToken = (state: RootState) =>
  state.auth.accessToken;

export const selectRefreshToken = (state: RootState) =>
  state.auth.refreshToken;

export const selectIsAuthenticated = (
  state: RootState
) => state.auth.isAuthenticated;

export const selectIsLoading = (
  state: RootState
) => state.auth.isLoading;

export const selectRememberMe = (
  state: RootState
) => state.auth.rememberMe;

export const selectError = (
  state: RootState
) => state.auth.error;

/* ============================================================
   Role Selectors
============================================================ */

export const selectIsAdmin = (
  state: RootState
) => state.auth.user?.role === "Admin";

export const selectIsHR = (
  state: RootState
) => state.auth.user?.role === "HR";

export const selectIsManager = (
  state: RootState
) => state.auth.user?.role === "Manager";

/* ============================================================
   Permission Helpers
============================================================ */

export const hasRole = (
  state: RootState,
  role: UserRole
): boolean => {
  return state.auth.user?.role === role;
};

export const hasAnyRole = (
  state: RootState,
  roles: UserRole[]
): boolean => {
  const currentRole = state.auth.user?.role;

  if (!currentRole) {
    return false;
  }

  return roles.includes(currentRole);
};

/* ============================================================
   Session Selectors
============================================================ */

export const selectSessionExpiry = (
  state: RootState
) => state.auth.expiresAt;

export const selectIsSessionExpired = (
  state: RootState
): boolean => {
  if (!state.auth.expiresAt) {
    return true;
  }

  return Date.now() >= state.auth.expiresAt;
};

/* ============================================================
   Default Export
============================================================ */

=======
export const { loginSuccess, logout } = authSlice.actions;
>>>>>>> origin/feature/ravi
export default authSlice.reducer;