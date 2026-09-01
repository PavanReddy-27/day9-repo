import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ["Annual", "Sick", "Casual", "Unpaid"],
      default: "Annual",
    },
    startDate: { type: String, required: true }, // Format "YYYY-MM-DD"
    endDate: { type: String, required: true },   // Format "YYYY-MM-DD"
    durationDays: { type: Number, required: true },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

leaveRequestSchema.index({ companyId: 1, employeeId: 1, status: 1 });

export default (mongoose.models.LeaveRequest || mongoose.model("LeaveRequest", leaveRequestSchema, "leaverequests")) as mongoose.Model<any>;
