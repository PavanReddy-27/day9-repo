import type { Request, Response } from "express";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";

/**
 * Builds personalized, role-appropriate notifications for a specific user.
 */
export const buildDefaultNotificationsForUser = (
  userId: mongoose.Types.ObjectId | string,
  companyId: mongoose.Types.ObjectId | string,
  role: string,
  employee?: { firstName?: string; lastName?: string; fullName?: string; departmentName?: string; employeeId?: string } | null
) => {
  const name = employee?.firstName || (role === "Admin" ? "Suman" : role === "HR" ? "Ravi" : role === "Manager" ? "Sridhika" : "Team Member");
  const dept = employee?.departmentName || "Engineering";
  const now = new Date();

  if (role === "Admin") {
    return [
      {
        companyId,
        userId,
        title: "System Security Audit",
        message: "Scheduled monthly security audit completed with 0 critical vulnerabilities detected.",
        type: "ALERT",
        linkUrl: "/admin/audit-logs",
        isRead: false,
        createdAt: new Date(now.getTime() - 45 * 60 * 1000), // 45m ago
      },
      {
        companyId,
        userId,
        title: "Workforce Directory Synchronized",
        message: "All 250 active employee accounts and role policies verified across all 7 departments.",
        type: "INFO",
        linkUrl: "/admin/dashboard",
        isRead: false,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2h ago
      },
      {
        companyId,
        userId,
        title: "Department Budget Review",
        message: `Q3 operational infrastructure budget review for ${dept} pending administrative sign-off.`,
        type: "WARNING",
        linkUrl: "/admin/departments",
        isRead: false,
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5h ago
      },
      {
        companyId,
        userId,
        title: "Database Health & Indexes Verified",
        message: "Attendance, payroll, and compliance indexes optimized and operating at peak performance.",
        type: "SUCCESS",
        linkUrl: "/admin/settings",
        isRead: true,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1d ago
      },
      {
        companyId,
        userId,
        title: "RBAC Security Policy Enforced",
        message: "Data-scope authorization rules active across Admin, HR, Manager, and Employee tiers.",
        type: "INFO",
        linkUrl: "/admin/roles",
        isRead: true,
        createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000), // 2d ago
      },
    ];
  }

  if (role === "HR") {
    return [
      {
        companyId,
        userId,
        title: "Pending Leave Approvals",
        message: "3 employee leave requests across departments are awaiting HR review and sign-off.",
        type: "ALERT",
        linkUrl: "/hr/leave-requests",
        isRead: false,
        createdAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
      {
        companyId,
        userId,
        title: "Monthly Payroll Cycle Ready",
        message: "September 2026 payroll run prepared for 250 employees. Ready for disbursement review.",
        type: "INFO",
        linkUrl: "/hr/payroll",
        isRead: false,
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      },
      {
        companyId,
        userId,
        title: "New Employee Onboarding",
        message: "Onboarding documentation and workstation setup completed for recent engineering joiners.",
        type: "SUCCESS",
        linkUrl: "/hr/employees",
        isRead: false,
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      },
      {
        companyId,
        userId,
        title: "Attendance Policy Compliance",
        message: "Weekly compliance review: 12 employees flagged for consecutive late arrivals this week.",
        type: "WARNING",
        linkUrl: "/hr/attendance",
        isRead: true,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
      {
        companyId,
        userId,
        title: "Recruitment Pipeline Update",
        message: "5 new applications received for Senior Full Stack Developer and QA positions.",
        type: "INFO",
        linkUrl: "/hr/recruitment",
        isRead: true,
        createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      },
    ];
  }

  if (role === "Manager") {
    return [
      {
        companyId,
        userId,
        title: "Team Leave Request Awaiting Review",
        message: "A team member submitted a Casual Leave request for next week. Awaiting your approval.",
        type: "ALERT",
        linkUrl: "/manager/leave-requests",
        isRead: false,
        createdAt: new Date(now.getTime() - 20 * 60 * 1000),
      },
      {
        companyId,
        userId,
        title: "Attendance Correction Submitted",
        message: "Attendance time adjustment requested for yesterday's shift. Please review.",
        type: "WARNING",
        linkUrl: "/manager/attendance",
        isRead: false,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        companyId,
        userId,
        title: "Team Sprint Milestone Reached",
        message: `Your ${dept} team achieved a 95% sprint task completion rate this cycle.`,
        type: "SUCCESS",
        linkUrl: "/manager/performance",
        isRead: false,
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      },
      {
        companyId,
        userId,
        title: "Daily Team Attendance Summary",
        message: "18 of 20 team members checked in on time today. 2 on approved leave.",
        type: "INFO",
        linkUrl: "/manager/dashboard",
        isRead: true,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
      {
        companyId,
        userId,
        title: "Skills Coverage Milestone",
        message: `Department competency index for ${dept} reached 88% following training completions.`,
        type: "INFO",
        linkUrl: "/manager/analytics",
        isRead: true,
        createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      },
    ];
  }

  // Employee Role
  return [
    {
      companyId,
      userId,
      title: "August 2026 Payslip Available",
      message: `Hi ${name}, your monthly payslip for the previous pay period is now available for download.`,
      type: "SUCCESS",
      linkUrl: "/employee/payroll",
      isRead: false,
      createdAt: new Date(now.getTime() - 35 * 60 * 1000),
    },
    {
      companyId,
      userId,
      title: "Daily Check-In Recorded",
      message: `Your check-in was successfully logged for today. Have a productive day at work!`,
      type: "INFO",
      linkUrl: "/employee/attendance",
      isRead: false,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      companyId,
      userId,
      title: "Leave Request Approved",
      message: `Your upcoming leave application has been approved by your manager.`,
      type: "SUCCESS",
      linkUrl: "/employee/leave-requests",
      isRead: true,
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
    {
      companyId,
      userId,
      title: "Upcoming Shift Schedule",
      message: `General Day Shift (09:00 AM - 06:00 PM) confirmed for your upcoming work cycle.`,
      type: "INFO",
      linkUrl: "/employee/attendance",
      isRead: true,
      createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
    },
  ];
};

// @desc    Get all notifications for the logged-in user
// @route   GET /api/v1/notifications
// @access  Private (strictly isolated per user)
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const companyId = (req as any).companyId;
    const role = (req as any).user?.role || (req as any).role || "Employee";
    const employee = (req as any).employee;

    if (!userId) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
    }

    // Strictly build possible ID matches for THIS authenticated user only
    const userObjectIds: any[] = [
      userId,
      ...(mongoose.Types.ObjectId.isValid(userId) ? [new mongoose.Types.ObjectId(userId)] : [])
    ];
    if (employee?._id) {
      userObjectIds.push(employee._id);
      if (mongoose.Types.ObjectId.isValid(employee._id)) {
        userObjectIds.push(new mongoose.Types.ObjectId(employee._id));
      }
    }

    let notifications = await (Notification as any).find({
      userId: { $in: userObjectIds }
    })
      .sort({ createdAt: -1 })
      .limit(50);

    // If user only has the generic legacy login alert, replace it with their role-tailored notifications
    const isOnlyGeneric = notifications.length === 1 && notifications[0].title === "Security Alert: New Login";
    if (isOnlyGeneric) {
      await (Notification as any).deleteMany({ userId: { $in: userObjectIds } });

      const defaultNotifs = buildDefaultNotificationsForUser(
        mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId,
        companyId || employee?.companyId || new mongoose.Types.ObjectId("6aa2a59d576fe6ecc7bff601"),
        role,
        employee
      );

      await (Notification as any).insertMany(defaultNotifs);

      notifications = await (Notification as any).find({
        userId: { $in: userObjectIds }
      })
        .sort({ createdAt: -1 })
        .limit(50);
    }

    res.json({ success: true, data: notifications });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server error while fetching notifications" });
  }
};

// @desc    Generate a new notification for the logged-in user on demand
// @route   POST /api/v1/notifications/generate
// @access  Private
export const generateNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const companyId = (req as any).companyId || (req as any).employee?.companyId || new mongoose.Types.ObjectId("6aa2a59d576fe6ecc7bff601");
    const role = (req as any).user?.role || (req as any).role || "Employee";
    const employee = (req as any).employee;

    if (!userId) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
    }

    const { title, message, type, linkUrl } = req.body || {};

    let newNotification;
    if (title && message) {
      newNotification = await Notification.create({
        companyId,
        userId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId,
        title,
        message,
        type: type || "INFO",
        linkUrl: linkUrl || (role === "Admin" ? "/admin/dashboard" : role === "HR" ? "/hr/dashboard" : role === "Manager" ? "/manager/dashboard" : "/employee/dashboard"),
        isRead: false,
      });
    } else {
      // Generate a dynamic role-appropriate event notification
      const defaults = buildDefaultNotificationsForUser(userId, companyId, role, employee);
      const chosen = defaults[Math.floor(Math.random() * defaults.length)];
      newNotification = await Notification.create({
        ...chosen,
        title: `[Live] ${chosen.title}`,
        createdAt: new Date(),
        isRead: false,
      });
    }

    res.status(201).json({ success: true, data: newNotification });
  } catch (error: any) {
    console.error("Error generating notification:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// @desc    Mark a specific notification as read (strictly verified for this user)
// @route   PATCH /api/v1/notifications/:id/read
// @access  Private
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const employee = (req as any).employee;

    const userObjectIds: any[] = [
      userId,
      ...(mongoose.Types.ObjectId.isValid(userId) ? [new mongoose.Types.ObjectId(userId)] : [])
    ];
    if (employee?._id) {
      userObjectIds.push(employee._id);
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: { $in: userObjectIds } } as any,
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

// @desc    Mark all notifications as read for the user (strictly verified for this user)
// @route   PATCH /api/v1/notifications/read-all
// @access  Private
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const employee = (req as any).employee;

    const userObjectIds: any[] = [
      userId,
      ...(mongoose.Types.ObjectId.isValid(userId) ? [new mongoose.Types.ObjectId(userId)] : [])
    ];
    if (employee?._id) {
      userObjectIds.push(employee._id);
    }

    await Notification.updateMany(
      { userId: { $in: userObjectIds }, isRead: false } as any,
      { $set: { isRead: true } }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete a specific notification (strictly verified for this user)
// @route   DELETE /api/v1/notifications/:id
// @access  Private
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const employee = (req as any).employee;

    const userObjectIds: any[] = [
      userId,
      ...(mongoose.Types.ObjectId.isValid(userId) ? [new mongoose.Types.ObjectId(userId)] : [])
    ];
    if (employee?._id) {
      userObjectIds.push(employee._id);
    }

    const notification = await (Notification as any).findOneAndDelete({
      _id: id,
      userId: { $in: userObjectIds }
    });

    if (!notification) {
      res.status(404).json({ success: false, message: "Notification not found or access denied" });
      return;
    }

    res.json({ success: true, message: "Notification removed successfully" });
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Clear all notifications for the authenticated user
// @route   DELETE /api/v1/notifications/clear-all
// @access  Private
export const clearAllNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const employee = (req as any).employee;

    const userObjectIds: any[] = [
      userId,
      ...(mongoose.Types.ObjectId.isValid(userId) ? [new mongoose.Types.ObjectId(userId)] : [])
    ];
    if (employee?._id) {
      userObjectIds.push(employee._id);
    }

    const result = await (Notification as any).deleteMany({
      userId: { $in: userObjectIds }
    });

    res.json({ success: true, message: "All notifications cleared successfully", deletedCount: result.deletedCount });
  } catch (error: any) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
