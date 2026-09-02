"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var correctionRequestSchema = new mongoose_1.default.Schema({
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    employeeId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    attendanceRecordId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "AttendanceRecord", default: null },
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
    reviewedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Employee", default: null },
    reviewedAt: { type: Date, default: null },
    comments: { type: String, default: "" },
}, { timestamps: true });
correctionRequestSchema.index({ companyId: 1, employeeId: 1, status: 1 });
exports.default = mongoose_1.default.models.CorrectionRequest || mongoose_1.default.model("CorrectionRequest", correctionRequestSchema, "correctionrequests");
