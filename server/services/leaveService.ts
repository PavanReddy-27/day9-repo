import mongoose from "mongoose";
import LeaveRequest from "../models/LeaveRequest.js";
import LeaveBalance from "../models/LeaveBalance.js";

/**
 * Calculates the exact number of leave days excluding weekends.
 * Real implementation could also query a Holiday collection.
 */
export const calculateLeaveDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return 0;
  }

  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) { // 0 = Sunday, 6 = Saturday
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
};

/**
 * Checks if the requested dates overlap with any existing Pending or Approved leaves for the employee.
 */
export const checkLeaveOverlap = async (
  companyId: mongoose.Types.ObjectId,
  employeeId: mongoose.Types.ObjectId,
  startDate: string,
  endDate: string,
  session?: mongoose.ClientSession
): Promise<boolean> => {
  const overlappingRequest = await LeaveRequest.findOne({
    companyId,
    employeeId,
    status: { $in: ["Pending", "Approved"] },
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  }).session(session || null);

  return !!overlappingRequest;
};

/**
 * Mocks the publishing of an unpaid leave to the payroll system.
 */
export const publishToPayroll = async (leaveRequest: any, session?: mongoose.ClientSession): Promise<void> => {
  // In a real system, this might send an event to a Kafka topic or call a Payroll API.
  console.log(`[Payroll Integration] Published unpaid leave for Employee ${leaveRequest.employeeId} to payroll.`);
  
  // Mark as processed
  leaveRequest.payrollProcessed = true;
  await leaveRequest.save({ session });
};

/**
 * Deducts the leave balance when approved. Throws if balance is insufficient.
 */
export const deductLeaveBalance = async (
  companyId: mongoose.Types.ObjectId,
  employeeId: mongoose.Types.ObjectId,
  leaveType: string,
  durationDays: number,
  session: mongoose.ClientSession
): Promise<void> => {
  if (leaveType === "Unpaid") return; // Unpaid doesn't deduct from paid balance allocations
  
  const year = new Date().getFullYear();
  const balance = await LeaveBalance.findOne({ companyId, employeeId, leaveType, year }).session(session);

  if (!balance) {
    throw new Error(`Leave balance record not found for type ${leaveType}`);
  }

  if (balance.available < durationDays) {
    throw new Error(`Insufficient leave balance for ${leaveType}. Available: ${balance.available}, Requested: ${durationDays}`);
  }

  balance.used += durationDays;
  balance.available -= durationDays;
  await balance.save({ session });
};

/**
 * Restores the leave balance when cancelled or rejected (if it was previously approved).
 */
export const restoreLeaveBalance = async (
  companyId: mongoose.Types.ObjectId,
  employeeId: mongoose.Types.ObjectId,
  leaveType: string,
  durationDays: number,
  session: mongoose.ClientSession
): Promise<void> => {
  if (leaveType === "Unpaid") return;
  
  const year = new Date().getFullYear();
  const balance = await LeaveBalance.findOne({ companyId, employeeId, leaveType, year }).session(session);

  if (balance) {
    balance.used = Math.max(0, balance.used - durationDays);
    balance.available += durationDays;
    await balance.save({ session });
  }
};
