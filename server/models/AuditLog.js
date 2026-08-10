import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    performedBy: { type: String, required: true }, // User email or employeeId or "System"
    userRole: { type: String, required: true },
    action: { type: String, required: true, trim: true },
    entityType: { type: String, default: "" },
    entityId: { type: String, default: "" },
    details: { type: String, required: true },
    ipAddress: { type: String, default: "127.0.0.1" },
    userAgent: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

auditLogSchema.index({ companyId: 1, timestamp: -1 });

export default mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema, "auditlogs");
