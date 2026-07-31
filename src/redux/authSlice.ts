import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: {
    username: string;
    rememberMe: boolean;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

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
        user: { username: string };
        rememberMe: boolean;
      }>,
    ) {
      state.isLoading = false;
      state.user = {
        ...action.payload.user,
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
