"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var leaveRequestSchema = new mongoose_1.default.Schema({
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    employeeId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    type: {
        type: String,
        required: true,
        enum: ["Annual", "Sick", "Casual", "Unpaid"],
        default: "Annual",
    },
    startDate: { type: String, required: true }, // Format "YYYY-MM-DD"
    endDate: { type: String, required: true }, // Format "YYYY-MM-DD"
    durationDays: { type: Number, required: true },
    reason: { type: String, required: true, trim: true },
    status: {
        type: String,
        required: true,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
        index: true,
    },
    reviewedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Employee", default: null },
    reviewedAt: { type: Date, default: null },
}, { timestamps: true });
leaveRequestSchema.index({ companyId: 1, employeeId: 1, status: 1 });
exports.default = mongoose_1.default.models.LeaveRequest || mongoose_1.default.model("LeaveRequest", leaveRequestSchema, "leaverequests");
