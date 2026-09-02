"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var breakSessionSchema = new mongoose_1.default.Schema({
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    attendanceRecordId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "AttendanceRecord", required: true, index: true },
    employeeId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    durationMinutes: { type: Number, default: 0 },
    reason: { type: String, default: "Lunch/Break" },
}, { timestamps: true });
breakSessionSchema.index({ companyId: 1, attendanceRecordId: 1 });
exports.default = mongoose_1.default.models.BreakSession || mongoose_1.default.model("BreakSession", breakSessionSchema, "breaksessions");
