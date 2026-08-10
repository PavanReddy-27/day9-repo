import mongoose from "mongoose";

const attendanceEventSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    attendanceRecordId: { type: mongoose.Schema.Types.ObjectId, ref: "AttendanceRecord", required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    eventType: {
      type: String,
      required: true,
      enum: ["CHECK_IN", "BREAK_START", "BREAK_END", "CHECK_OUT"],
    },
    timestamp: { type: Date, required: true },
    locationCoordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    gpsAccuracy: { type: Number, default: 0 },
    isGeofenced: { type: Boolean, default: true },
    distanceMeters: { type: Number, default: 0 },
    deviceId: { type: String, default: "web-client" },
    idempotencyKey: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

attendanceEventSchema.index({ companyId: 1, attendanceRecordId: 1, timestamp: 1 });

export default mongoose.models.AttendanceEvent || mongoose.model("AttendanceEvent", attendanceEventSchema, "attendanceevents");
