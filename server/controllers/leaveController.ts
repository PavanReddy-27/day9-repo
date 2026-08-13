import type { Request, Response } from "express";
import LeaveRequest from "../models/LeaveRequest.js";
import Employee from "../models/Employee.js";

// @desc    Get all leave requests
// @route   GET /api/v1/leaves
// @access  Private (Role-based data scope applied via middleware)
// @desc    Get all leave requests
// @route   GET /api/v1/leaves
// @access  Private (Role-based data scope applied via middleware)
export const getLeaveRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = (req as any).user || { role: (req as any).role };
    const { status } = req.query;

    let query: any = {};

    // Apply filters based on role
    if (role === "Employee") {
      const empId = (req as any).employee?._id;
      if (!empId) {
        res.status(404).json({ error: "Employee profile not found" });
        return;
      }
      query.employeeId = empId;
    } else if (role === "Manager") {
      const empProfile = (req as any).employee;
      if (empProfile && empProfile.departmentId) {
        const teamMembers = await (Employee as any).find({ departmentId: empProfile.departmentId }).select("_id");
        query.employeeId = { $in: teamMembers.map((e: any) => e._id) };
      }
    }

    if (status && typeof status === "string" && status !== "All") {
      query.status = status;
    }

    const leaves = await LeaveRequest.find(query)
      .populate("employeeId", "firstName lastName employeeId departmentId")
      .populate("reviewedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Apply for a leave request
// @route   POST /api/v1/leaves
// @access  Private (Employee)
export const createLeaveRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const { type, startDate, endDate, reason } = req.body;

    const empId = (req as any).employee?._id;
    if (!empId) {
      res.status(404).json({ error: "Employee profile not found" });
      return;
    }

    const fromDate = new Date(startDate);
    const toDate = new Date(endDate);
    const durationDays = Math.max(1, Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24)) + 1);

    const newLeave: any = await LeaveRequest.create({
      companyId,
      employeeId: empId,
      type,
      startDate,
      endDate,
      durationDays,
      reason,
      status: "Pending",
    });

    const populatedLeave = await (LeaveRequest as any).findById(newLeave._id as any).populate("employeeId", "firstName lastName employeeId");

    res.status(201).json(populatedLeave);
  } catch (error) {
    console.error("Error creating leave request:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Approve or Reject a leave request
// @route   PATCH /api/v1/leaves/:id/status
// @access  Private (Manager / HR / Admin)
export const updateLeaveStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const role = (req as any).user?.role || (req as any).role;
    if (role !== "Manager") {
      res.status(403).json({ error: "Only managers are allowed to approve or reject leave requests" });
      return;
    }

    const reviewerId = (req as any).employee?._id || (req as any).user?.id;

    const leave = await (LeaveRequest as any).findByIdAndUpdate(
      id,
      { 
        status,
        reviewedBy: reviewerId || null,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate("employeeId", "firstName lastName employeeId").populate("reviewedBy", "firstName lastName");

    if (!leave) {
      res.status(404).json({ error: "Leave request not found" });
      return;
    }

    res.json(leave);
  } catch (error) {
    console.error("Error updating leave status:", error);
    res.status(500).json({ error: "Server error" });
  }
};
