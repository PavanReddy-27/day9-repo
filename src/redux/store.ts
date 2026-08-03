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
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;