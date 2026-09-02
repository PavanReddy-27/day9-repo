"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var auditLogSchema = new mongoose_1.default.Schema({
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    performedBy: { type: String, required: true }, // User email or employeeId or "System"
    userRole: { type: String, required: true },
    action: { type: String, required: true, trim: true },
    entityType: { type: String, default: "" },
    entityId: { type: String, default: "" },
    details: { type: String, required: true },
    ipAddress: { type: String, default: "127.0.0.1" },
    userAgent: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now, index: true },
}, { timestamps: true });
auditLogSchema.index({ companyId: 1, timestamp: -1 });
exports.default = mongoose_1.default.models.AuditLog || mongoose_1.default.model("AuditLog", auditLogSchema, "auditlogs");
