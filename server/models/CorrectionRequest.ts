import mongoose from "mongoose";

const correctionRequestSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    attendanceRecordId: { type: mongoose.Schema.Types.ObjectId, ref: "AttendanceRecord", default: null },
    date: { type: String, required: true },
    
    originalCheckIn: { type: Date, default: null },
    originalCheckOut: { type: Date, default: null },
    requestedCheckIn: { type: Date, default: null },
    requestedCheckOut: { type: Date, default: null },
    
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
    comments: { type: String, default: "" },
  },
  { timestamps: true }
);

correctionRequestSchema.index({ companyId: 1, employeeId: 1, status: 1 });

export default mongoose.models.CorrectionRequest || mongoose.model("CorrectionRequest", correctionRequestSchema, "correctionrequests");
