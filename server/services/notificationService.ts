import Notification from "../models/Notification.js";
import { sendSSEToUser } from "../utils/sse.js";
import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import { writeAuditLog } from "../utils/audit.js";
import SystemLog from "../models/SystemLog.js";
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
    } catch (error: any) {
      logger.error(`[NotificationService] Notification delivery failure: ${error?.message || 'Unknown error'}`, {
        context: 'Notification',
        userId: userId?.toString(),
        companyId: companyId?.toString(),
        title,
        error: error?.message || "Unknown error",
      });
      await SystemLog.create({
        level: 'error',
        category: 'Notification',
        message: `Failed to deliver notification: ${title}`,
        userId: userId,
        stack: error.stack,
        metadata: { title, type },
      }).catch(() => {});
      void writeAuditLog(
        { companyId: companyId as any, role: 'System', userEmail: 'system@workforce.local' },
        'NOTIFICATION_DELIVERY_FAILED',
        `Notification delivery failed: ${error?.message || 'Unknown error'} (Title: ${title})`,
        'Notification',
        userId?.toString()
      );
      console.error("[NotificationService] Error creating/sending notification:", error);
      return null;
    }
  }
}
