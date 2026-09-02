import type { Request, Response } from "express";
import LeaveRequest from "../models/LeaveRequest.js";
import Employee from "../models/Employee.js";
import Notification from "../models/Notification.js";
import ApprovalHistory from "../models/ApprovalHistory.js";
import { writeAuditLog } from "../utils/audit.js";
import { broadcastSSE } from "../utils/sse.js";
import mongoose from "mongoose";
import { calculateLeaveDuration, checkLeaveOverlap, deductLeaveBalance, restoreLeaveBalance, publishToPayroll } from "../services/leaveService.js";

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
    const companyId = (req as any).companyId;
    const reqEmpId = (req as any).employee?._id;

    if (!reqEmpId && role !== 'Admin') {
      res.status(404).json({ error: "Employee profile not found" });
      return;
    }

    const query: any = { companyId };

    if (role === "Employee") {
      query.employeeId = reqEmpId;
    } else if (role === "Manager") {
      // Find all employees in manager's department OR employees who report directly to this manager
      const reqEmp = await Employee.findById(reqEmpId).lean();
      if (reqEmp) {
        const managedEmployees = await Employee.find({
          companyId,
          $or: [
            { departmentId: reqEmp.departmentId },
            { managerId: reqEmpId }
          ]
        }).select('_id');
        query.employeeId = { $in: managedEmployees.map(e => e._id) };
      }
    } else if (role === "Team Lead") {
      // Only see own team members
      const reqEmp = await Employee.findById(reqEmpId).lean();
      if (reqEmp && reqEmp.teamId) {
        const teamEmployees = await Employee.find({ companyId, teamId: reqEmp.teamId }).select('_id');
        query.employeeId = { $in: teamEmployees.map(e => e._id) };
      } else {
        query.employeeId = reqEmpId; // fallback to self if no team assigned
      }
    }
    // HR / Admin: see all

    if (status && typeof status === "string" && status !== "All") {
      query.status = status;
    }

    const leaves = await LeaveRequest.find(query)
      .populate("employeeId", "firstName lastName employeeId departmentId teamId")
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
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime()) || fromDate > toDate) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ error: "Invalid date range" });
      return;
    }

    const empId = (req as any).employee?._id;
    if (!empId) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ error: "Employee profile not found" });
      return;
    }

    // Overlap prevention
    const hasOverlap = await checkLeaveOverlap(companyId, empId, startDate, endDate, session);
    if (hasOverlap) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ error: "Dates overlap with an existing leave request" });
      return;
    }

    const durationDays = calculateLeaveDuration(startDate, endDate);
    if (durationDays <= 0) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ error: "Calculated duration is 0 days (e.g. only weekends selected)" });
      return;
    }

    const newLeaveArr = await LeaveRequest.create([{
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

    // Audit and History
    await writeAuditLog(req, "LEAVE_REQUESTED", `Requested ${type} leave (${startDate} to ${endDate})`, "LeaveRequest", String(newLeave._id), { session });
    await ApprovalHistory.create([{
      companyId,
      leaveRequestId: newLeave._id,
      action: "Submitted",
      performedBy: empId,
      previousStatus: "None",
      newStatus: "Pending",
      comments: "Leave requested by employee",
    }], { session });

    await session.commitTransaction();
    session.endSession();
    
    // Fetch populated version after commit
    const populatedLeave = await LeaveRequest.findById(newLeave._id).populate("employeeId", "firstName lastName employeeId");
    res.status(201).json(populatedLeave);
  } catch (error) {
    if (session && session.inTransaction()) await session.abortTransaction();
    if (session) session.endSession();
    next(error);
  }
};

// @desc    Approve, Reject, or Cancel a leave request
// @route   PATCH /api/v1/leaves/:id/status
// @access  Private
export const updateLeaveStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const { id } = req.params;
    const { status, comments } = req.body;
    const companyId = (req as any).companyId;

    if (!["Approved", "Rejected", "Cancelled"].includes(status)) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const role = (req as any).user?.role || (req as any).role;
    const reviewerId = (req as any).employee?._id || (req as any).user?.id;

    // Fetch existing leave request with employee details
    const leave = await LeaveRequest.findOne({ _id: id, companyId }).populate("employeeId").session(session);
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

    const targetEmpId = leave.employeeId._id;
    const previousStatus = leave.status;

    // Authorization checks
    if (status === "Cancelled") {
      // Only the employee who requested it can cancel it, OR an admin/HR
      if (targetEmpId.toString() !== reviewerId?.toString() && !['Admin', 'HR'].includes(role)) {
        await session.abortTransaction();
        session.endSession();
        res.status(403).json({ error: "Unauthorized to cancel this leave" });
        return;
      }
    } else {
      // Approved or Rejected
      if (['Manager', 'Team Lead'].includes(role)) {
        const reviewerEmp = await Employee.findById(reviewerId).lean().session(session);
        if (!reviewerEmp) {
          await session.abortTransaction();
          session.endSession();
          res.status(403).json({ error: "Reviewer employee record not found" });
          return;
        }
        
        if (role === "Team Lead") {
          if (leave.employeeId.teamId?.toString() !== reviewerEmp.teamId?.toString()) {
            await session.abortTransaction();
            session.endSession();
            res.status(403).json({ error: "Unauthorized: Employee not in your team" });
            return;
          }
        } else if (role === "Manager") {
          // Manager can approve for their department or direct reports
          const isDirectReport = leave.employeeId.managerId?.toString() === reviewerId.toString();
          const isSameDept = leave.employeeId.departmentId?.toString() === reviewerEmp.departmentId?.toString();
          if (!isDirectReport && !isSameDept) {
            await session.abortTransaction();
            session.endSession();
            res.status(403).json({ error: "Unauthorized: Employee not in your department or direct report" });
            return;
          }
        }
      } else if (!['Admin', 'HR'].includes(role)) {
        await session.abortTransaction();
        session.endSession();
        res.status(403).json({ error: "Unauthorized to approve/reject leaves" });
        return;
      }
    }

    // Invalid state transitions
    if (previousStatus === "Cancelled" || previousStatus === "Rejected") {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ error: "Cannot modify a cancelled or rejected leave" });
      return;
    }

    // Balance Logic
    if (status === "Approved" && previousStatus !== "Approved") {
      try {
        await deductLeaveBalance(companyId, targetEmpId, leave.type, leave.durationDays, session);
      } catch (err: any) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ error: err.message });
        return;
      }
      if (leave.type === "Unpaid") {
        await publishToPayroll(leave, session);
      }
    } else if ((status === "Rejected" || status === "Cancelled") && previousStatus === "Approved") {
      await restoreLeaveBalance(companyId, targetEmpId, leave.type, leave.durationDays, session);
    }

    // Apply updates
    leave.status = status;
    if (status !== "Cancelled") {
      leave.reviewedBy = reviewerId;
      leave.reviewedAt = new Date();
    }
    await leave.save({ session });

    // History and Audit
    await writeAuditLog(req, `LEAVE_${status.toUpperCase()}`, `${status} leave request ${String(id)}`, "LeaveRequest", String(id), { session });
    await ApprovalHistory.create([{
      companyId,
      leaveRequestId: leave._id,
      action: status,
      performedBy: reviewerId,
      previousStatus,
      newStatus: status,
      comments: comments || "",
    }], { session });

    // Notifications and SSE
    if (leave.employeeId?.userId && targetEmpId.toString() !== reviewerId?.toString()) {
      const typeStr = leave.type || "Leave";
      const reviewedByName = (await Employee.findById(reviewerId).select("firstName").lean().session(session))?.firstName || "your manager";
      const message = `Your ${typeStr} request from ${leave.startDate} to ${leave.endDate} has been ${status.toLowerCase()} by ${reviewedByName}.`;
      const notifType = status === "Approved" ? "SUCCESS" : "WARNING";

      const notifArr = await Notification.create([{
        companyId,
        userId: leave.employeeId.userId,
        title: `Leave Request ${status}`,
        message,
        type: notifType,
        linkUrl: "/employee/leaves"
      }], { session });

      broadcastSSE("NOTIFICATION_UPDATE", { userId: leave.employeeId.userId.toString(), notificationId: notifArr[0]._id }, companyId);
    }
    broadcastSSE("LEAVE_UPDATE", { employeeId: targetEmpId.toString(), status, leaveId: leave._id }, companyId);

    await session.commitTransaction();
    session.endSession();

    const populatedLeave = await LeaveRequest.findById(leave._id)
      .populate("employeeId", "firstName lastName employeeId userId")
      .populate("reviewedBy", "firstName lastName");
      
    res.json(populatedLeave);
  } catch (error) {
    if (session && session.inTransaction()) await session.abortTransaction();
    if (session) session.endSession();
    next(error);
  }
};
