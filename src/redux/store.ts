// src/redux/store.ts

import {
  configureStore,
  type Action,
  type ThunkAction,
} from "@reduxjs/toolkit";

import authReducer from "./authSlice";
import dashboardReducer from "./dashboardSlice";

/* ==========================================================
   Store Configuration
========================================================== */

export const store = configureStore({
  reducer: {
    auth: authReducer,

    dashboard: dashboardReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
        ignoredPaths: [],
      },

      immutableCheck: true,
    }),

  devTools: import.meta.env.DEV,
});

/* ==========================================================
   Types
========================================================== */

export type RootState = ReturnType<
  typeof store.getState
>;

export type AppDispatch =
  typeof store.dispatch;

export type AppThunk<
  ReturnType = void
> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

/* ==========================================================
   Selectors
========================================================== */

export const selectAuthState = (
  state: RootState
) => state.auth;

export const selectDashboardState = (
  state: RootState
) => state.dashboard;