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
    idempotencyKey: { type: String, default: null },
  },
  { timestamps: true }
);

attendanceEventSchema.index({ companyId: 1, attendanceRecordId: 1, timestamp: 1 });
// Idempotency keys must be unique ONLY when present. Many events legitimately
// have no key (idempotencyKey: null); a plain unique index would reject every
// keyless event after the first. A partial index scopes uniqueness to real
// string keys so duplicate-request protection still holds without blocking
// normal check-ins/outs.
attendanceEventSchema.index(
  { idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: "string" } } }
);

export default mongoose.models.AttendanceEvent || mongoose.model("AttendanceEvent", attendanceEventSchema, "attendanceevents");
