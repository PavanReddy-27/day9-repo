import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './dashboardSlice';
import authReducer from './authSlice'; // or whatever your auth slice is named
import hrReducer from './hrSlice';     // 👈 1. Import hrReducer

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    auth: authReducer,
    hr: hrReducer,                    // 👈 2. Add hr here
  },
  // The dashboard slice holds 10,000 mock employee records. The default
  // SerializableStateInvariantMiddleware traverses the entire state on every
  // dispatch, which exceeds its 32ms warning threshold and slows down dev mode.
  // This check is dev-only (disabled in production builds), so it is safe to
  // turn off here.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
