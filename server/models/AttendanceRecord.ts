import mongoose from "mongoose";

const attendanceRecordSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true, index: true },
    date: { type: String, required: true, index: true }, // Format "YYYY-MM-DD"
    
    checkInTime: { type: Date, default: null },
    checkOutTime: { type: Date, default: null },
    
    workDurationMinutes: { type: Number, default: 0 },
    breakDurationMinutes: { type: Number, default: 0 },
    overtimeMinutes: { type: Number, default: 0 },
    lateMinutes: { type: Number, default: 0 },
    earlyDepartureMinutes: { type: Number, default: 0 },
    
    status: {
      type: String,
      required: true,
      enum: ["Not Checked In", "Working", "On Break", "Checked Out"],
      default: "Not Checked In",
      index: true,
    },
    
    shiftKind: { type: String, enum: ["Regular", "Flexible", "Night", "CrossMidnight"], default: "Regular" },
    isNightShift: { type: Boolean, default: false },
  },
  { timestamps: true }
);

attendanceRecordSchema.index({ companyId: 1, employeeId: 1, date: 1 }, { unique: true });
attendanceRecordSchema.index({ companyId: 1, date: 1, status: 1 });

export default mongoose.models.AttendanceRecord || mongoose.model("AttendanceRecord", attendanceRecordSchema, "attendancerecords");
