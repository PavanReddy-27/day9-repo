import mongoose from "mongoose";

const leaveBalanceSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
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
    used: {
      type: Number,
      required: true,
      default: 0,
    },
    carriedForward: {
      type: Number,
      default: 0,
    },
    available: {
      type: Number,
      required: true,
      default: 0,
    },
    year: {
      type: Number,
      required: true,
      default: new Date().getFullYear(),
    }
  },
  { timestamps: true }
);

// Prevent duplicate balances for same user/type/year
leaveBalanceSchema.index({ companyId: 1, employeeId: 1, leaveType: 1, year: 1 }, { unique: true });

const LeaveBalance = mongoose.models.LeaveBalance || mongoose.model("LeaveBalance", leaveBalanceSchema, "leavebalances");
export default LeaveBalance as typeof mongoose.Model;
