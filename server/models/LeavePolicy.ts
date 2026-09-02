import mongoose from "mongoose";

const leavePolicySchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    leaveType: {
      type: String,
      required: true,
      enum: ["Annual", "Sick", "Casual", "Comp-Off", "Unpaid"],
    },
    totalAllocated: {
      type: Number,
      required: true,
      default: 0,
    },
    accrualRate: {
      type: String, // e.g., "Monthly", "Yearly", "None"
      default: "Yearly",
    },
    carryForwardLimit: {
      type: Number,
      default: 0,
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
    requiresApproval: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

// Prevent duplicate leave types for the same company
leavePolicySchema.index({ companyId: 1, leaveType: 1 }, { unique: true });

const LeavePolicy = mongoose.models.LeavePolicy || mongoose.model("LeavePolicy", leavePolicySchema, "leavepolicies");
export default LeavePolicy as typeof mongoose.Model;
