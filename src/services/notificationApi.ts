import { apiClient } from "./apiClient";

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "SUCCESS" | "ALERT";
  isRead: boolean;
  linkUrl: string;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: async () => {
    return await apiClient<Notification[]>("/notifications", { method: "GET" });
  },
  markAsRead: async (id: string) => {
    return await apiClient<Notification>(`/notifications/${id}/read`, { method: "PATCH" });
  },
  markAllAsRead: async () => {
    const res = await apiClient<{ success: boolean; message: string }>("/notifications/read-all", { method: "PATCH" });
    return res.success;
  }
};
