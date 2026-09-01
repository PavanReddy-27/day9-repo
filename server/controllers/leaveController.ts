import type { Request, Response } from "express";
import LeaveRequest from "../models/LeaveRequest.js";
import Employee from "../models/Employee.js";
import Notification from "../models/Notification.js";
import { writeAuditLog } from "../utils/audit.js";
import { broadcastSSE } from "../utils/sse.js";
import mongoose from "mongoose";

// @desc    Get all leave requests
// @route   GET /api/v1/leaves
import type { Request, Response, NextFunction } from "express";
// @desc    Get all leave requests
// @route   GET /api/v1/leaves
// @access  Private (Role-based data scope applied via middleware)
export const getLeaveRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = (req as any).user || { role: (req as any).role };
    const { status } = req.query;

    const query: any = { companyId: (req as any).companyId };

    // Apply filters based on role
    if (role === "Employee") {
      const empId = (req as any).employee?._id;
      if (!empId) {
        res.status(404).json({ error: "Employee profile not found" });
        return;
      }
      query.employeeId = empId;
    } else if (role === "Manager") {
      // Managers can only see leave requests from their own department
      const departmentId = (req as any).employee?.departmentId;
      if (departmentId) {
        // Find employees in this department
        const employeesInDept = await Employee.find({ departmentId, companyId: (req as any).companyId }).select('_id');
        const empIds = employeesInDept.map(e => e._id);
        query.employeeId = { $in: empIds };
      }
    }
    // HR / Admin: company-wide visibility (all statuses, incl. Pending to review).

    if (status && typeof status === "string" && status !== "All") {
      query.status = status;
    }

    const leaves = await LeaveRequest.find(query)
      .populate("employeeId", "firstName lastName employeeId departmentId")
      .populate("reviewedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    next(error);
  }
};

// @desc    Apply for a leave request
// @route   POST /api/v1/leaves
// @access  Private (Employee)
export const createLeaveRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const companyId = (req as any).companyId;
    const { type, startDate, endDate, reason } = req.body;

    if (!type || !startDate || !endDate || !reason) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ error: "Missing required fields: type, startDate, endDate, reason" });
      return;
    }

    const fromDate = new Date(startDate);
    const toDate = new Date(endDate);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ error: "Invalid date format provided" });
      return;
    }

    if (fromDate > toDate) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ error: "Start date must be before or equal to end date" });
      return;
    }

    const empId = (req as any).employee?._id;
    if (!empId) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ error: "Employee profile not found" });
      return;
    }


    const durationDays = Math.max(1, Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24)) + 1);

    const newLeaveArr: any = await LeaveRequest.create([{
      companyId,
      employeeId: empId,
      type,
      startDate,
      endDate,
      durationDays,
      reason,
      status: "Pending",
    }], { session });
    const newLeave = newLeaveArr[0];

    const populatedLeave = await (LeaveRequest as any).findById(newLeave._id as any).session(session).populate("employeeId", "firstName lastName employeeId");

    await writeAuditLog(req, "LEAVE_REQUESTED", `Requested ${type} leave (${startDate} to ${endDate})`, "LeaveRequest", String(newLeave._id), { session });

    await session.commitTransaction();
    session.endSession();
    res.status(201).json(populatedLeave);
  } catch (error) {
    if (session && session.inTransaction()) await session.abortTransaction();
    if (session) session.endSession();
    next(error);
  }
};

// @desc    Approve or Reject a leave request
// @route   PATCH /api/v1/leaves/:id/status
// @access  Private (Manager / HR / Admin)
export const updateLeaveStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const role = (req as any).user?.role || (req as any).role;
    if (role !== "Manager") {
      await session.abortTransaction();
      session.endSession();
      res.status(403).json({ error: "Only managers may approve or reject leave requests" });
      return;
    }

    const reviewerId = (req as any).employee?._id || (req as any).user?.id;

    const leave = await (LeaveRequest as any).findOneAndUpdate(
      { _id: id, companyId: (req as any).companyId },
      {
        status,
        reviewedBy: reviewerId || null,
        reviewedAt: new Date()
      },
      { new: true, session }
    ).populate("employeeId", "firstName lastName employeeId userId").populate("reviewedBy", "firstName lastName");

    if (!leave) {
      const crossCompanyLeak = await (LeaveRequest as any).findById(id).session(session);
      if (crossCompanyLeak) {
        const { logComplianceViolation } = await import('../utils/compliance.js');
        await logComplianceViolation('CROSS_COMPANY_ACCESS', `Attempted cross-company leave access: ${id}`, 'Critical', { id }, req);
      }
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ error: "Leave request not found" });
      return;
    }

    await writeAuditLog(req, `LEAVE_${status.toUpperCase()}`, `${status} leave request ${String(id)}`, "LeaveRequest", String(id), { session });

    if (leave.employeeId?.userId) {
      const typeStr = leave.type || "Leave";
      const reviewedByName = leave.reviewedBy?.firstName || "your manager";
      const message = `Your ${typeStr} request from ${leave.startDate} to ${leave.endDate} has been ${status.toLowerCase()} by ${reviewedByName}.`;
      const notifType = status === "Approved" ? "SUCCESS" : "WARNING";

      const notifArr: any = await Notification.create([{
        companyId: (req as any).companyId,
        userId: leave.employeeId.userId,
        title: `Leave Request ${status}`,
        message,
        type: notifType,
        linkUrl: "/employee/leaves"
      }], { session });

      broadcastSSE("NOTIFICATION_UPDATE", { userId: leave.employeeId.userId.toString(), notificationId: notifArr[0]._id }, (req as any).companyId);
      broadcastSSE("LEAVE_UPDATE", { employeeId: leave.employeeId._id.toString(), status, leaveId: leave._id }, (req as any).companyId);
    }

    await session.commitTransaction();
    session.endSession();
    res.json(leave);
  } catch (error) {
    if (session && session.inTransaction()) await session.abortTransaction();
    if (session) session.endSession();
    next(error);
  }
};
