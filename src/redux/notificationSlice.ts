import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationApi, Notification } from "../services/notificationApi";

export interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
  unreadCount: 0,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async () => {
    return await notificationApi.getNotifications();
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id: string) => {
    return await notificationApi.markAsRead(id);
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async () => {
    await notificationApi.markAllAsRead();
    return true;
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n: Notification) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch notifications";
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const updatedNotification = action.payload;
        const index = state.notifications.findIndex((n) => n._id === updatedNotification._id);
        if (index !== -1) {
          state.notifications[index] = updatedNotification;
        }
        state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((n: Notification) => (n.isRead = true));
        state.unreadCount = 0;
      });
  },
});

export default notificationSlice.reducer;
