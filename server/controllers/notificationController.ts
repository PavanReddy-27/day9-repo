import type { Request, Response } from "express";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";

// @desc    Get all notifications for the logged-in user
// @route   GET /api/v1/notifications
// @access  Private
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const companyId = (req as any).companyId;

    if (!userId) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
    }

    const notifications = await Notification.find({ userId, companyId } as any)
      .sort({ createdAt: -1 })
      .limit(50); // Limit to recent 50 notifications

    res.json({ success: true, data: notifications });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server error while fetching notifications" });
  }
};

// @desc    Mark a specific notification as read
// @route   PATCH /api/v1/notifications/:id/read
// @access  Private
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const companyId = (req as any).companyId;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId, companyId } as any,
      { isRead: true },
      { new: true } as any
    );

    if (!notification) {
      res.status(404).json({ success: false, message: "Notification not found" });
      return;
    }

    res.json({ success: true, data: notification });
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Mark all notifications as read for the user
// @route   PATCH /api/v1/notifications/read-all
// @access  Private
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const companyId = (req as any).companyId;

    await Notification.updateMany(
      { userId, companyId, isRead: false } as any,
      { $set: { isRead: true } }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
