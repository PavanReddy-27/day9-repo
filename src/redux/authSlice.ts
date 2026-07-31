import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: {
    id: number;
    username: string;
    role: "admin" | "hr" | "manager" | "analyst";
    rememberMe: boolean;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const normalizeRole = (role: string): AuthState["user"] extends infer U ? U extends { role: infer R } ? R : never : never => {
  const normalized = role.toLowerCase();

  if (normalized === "admin" || normalized === "hr" || normalized === "manager" || normalized === "analyst") {
    return normalized;
  }

  return "analyst";
};

const getStoredAuthState = (): AuthState => {
  const sessionValue = localStorage.getItem("auth_user");

  if (!sessionValue) {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  }

  try {
    const session = JSON.parse(sessionValue);

    if (Date.now() > session.expiresAt) {
      localStorage.removeItem("auth_user");
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    }

    return {
      user: {
        ...session.user,
        role: normalizeRole(session.user.role),
        rememberMe: Boolean(session.rememberMe),
      },
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };
  } catch {
    localStorage.removeItem("auth_user");
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  }
};

const initialState: AuthState = getStoredAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(
      state,
      action: PayloadAction<{
        user: { id: number; username: string; role: string };
        rememberMe: boolean;
      }>,
    ) {
      state.isLoading = false;
      state.user = {
        ...action.payload.user,
        role: normalizeRole(action.payload.user.role),
        rememberMe: action.payload.rememberMe,
      };
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    clearError(state) {
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  clearError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
