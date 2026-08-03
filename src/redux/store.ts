import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "./dashboardSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    auth: authReducer,
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
