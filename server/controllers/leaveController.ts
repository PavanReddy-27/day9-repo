import type { Request, Response } from "express";
import LeaveRequest from "../models/LeaveRequest.js";
import Employee from "../models/Employee.js";

// @desc    Get all leave requests
// @route   GET /api/v1/leaves
// @access  Private (Role-based data scope applied via middleware)
export const getLeaveRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.user!;
    const companyId = (req as any).companyId;
    const { status } = req.query;

    let query: any = { companyId };

    // Apply filters based on role
    if (role === "Employee") {
      // Employees can only see their own leaves
      const empId = (req as any).employee?._id;
      if (!empId) {
        res.status(404).json({ error: "Employee profile not found" });
        return;
      }
      query.employeeId = empId;
    } else if (role === "Manager") {
      // Managers see leaves for employees in their department/team
      // For simplicity in this demo, let's say they can see all in their company 
    } else if (role === "Admin" || role === "HR") {
      // Admin and HR should ONLY see Approved or Rejected leaves, not Pending
      query.status = { $in: ["Approved", "Rejected"] };
    }

    // Override with explicit status query if provided, and ensure Admin/HR don't query Pending
    if (status && typeof status === "string") {
      if ((role === "Admin" || role === "HR") && status === "Pending") {
         res.status(403).json({ error: "Access denied to Pending leaves for this role" });
         return;
      }
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
    const { role } = req.user!;
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

    const newLeave = await LeaveRequest.create({
      companyId,
      employeeId: empId,
      type,
      startDate,
      endDate,
      durationDays,
      reason,
      status: "Pending",
    });

    const populatedLeave = await LeaveRequest.findById(newLeave._id).populate("employeeId", "firstName lastName employeeId");

    res.status(201).json(populatedLeave);
  } catch (error) {
    console.error("Error creating leave request:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Approve or Reject a leave request
// @route   PATCH /api/v1/leaves/:id/status
// @access  Private (Manager only)
export const updateLeaveStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.user!;
    const companyId = (req as any).companyId;
    const { id } = req.params;
    const { status } = req.body;

    if (role !== "Manager") {
      res.status(403).json({ error: "Only managers can approve or reject leaves" });
      return;
    }

    if (!["Approved", "Rejected"].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const managerId = (req as any).employee?._id;

    const leave = await LeaveRequest.findOneAndUpdate(
      { _id: id, companyId },
      { 
        status,
        reviewedBy: managerId || null,
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
