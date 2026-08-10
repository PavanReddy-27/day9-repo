import mongoose from "mongoose";

const breakSessionSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    attendanceRecordId: { type: mongoose.Schema.Types.ObjectId, ref: "AttendanceRecord", required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    durationMinutes: { type: Number, default: 0 },
    reason: { type: String, default: "Lunch/Break" },
  },
  { timestamps: true }
);

breakSessionSchema.index({ companyId: 1, attendanceRecordId: 1 });

export default mongoose.models.BreakSession || mongoose.model("BreakSession", breakSessionSchema, "breaksessions");
