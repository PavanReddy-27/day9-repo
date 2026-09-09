import Notification from "../models/Notification.js";
import { sendSSEToUser } from "../utils/sse.js";
import mongoose from "mongoose";

export class NotificationService {
  /**
   * Creates a notification in the database and pushes it to the user via SSE.
   * @param userId The User ID who should receive the notification
   * @param companyId The Company ID
   * @param title Title of the notification
   * @param message Detailed message
   * @param type Notification type: "INFO", "WARNING", "SUCCESS", "ALERT"
   * @param linkUrl Optional frontend routing link
   */
  static async sendNotification(
    userId: string | mongoose.Types.ObjectId,
    companyId: string | mongoose.Types.ObjectId,
    title: string,
    message: string,
    type: "INFO" | "WARNING" | "SUCCESS" | "ALERT" = "INFO",
    linkUrl: string = ""
  ) {
    try {
      const notification = await Notification.create({
        companyId,
        userId,
        title,
        message,
        type,
        linkUrl,
      });

      // Send the real-time event to the specific user's SSE connection
      sendSSEToUser(userId.toString(), "NOTIFICATION_UPDATE", {
        notificationId: notification._id,
        title,
        message,
        type,
        linkUrl,
      });

      return notification;
    } catch (error) {
      console.error("[NotificationService] Error creating/sending notification:", error);
    }
  }
}
