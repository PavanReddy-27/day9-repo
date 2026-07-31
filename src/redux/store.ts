<<<<<<< HEAD
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
=======
import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './dashboardSlice';
import authReducer from './authSlice'; // or whatever your auth slice is named
import hrReducer from './hrSlice';     // 👈 1. Import hrReducer
>>>>>>> origin/feature/ravi

export const store = configureStore({
  reducer: {
    auth: authReducer,
<<<<<<< HEAD

    dashboard: dashboardReducer,
=======
    hr: hrReducer,                    // 👈 2. Add hr here
>>>>>>> origin/feature/ravi
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