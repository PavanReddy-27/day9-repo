"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var shiftAssignmentSchema = new mongoose_1.default.Schema({
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    employeeId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    shiftId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Shift", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    status: { type: String, enum: ["Active", "Historical", "Cancelled"], default: "Active" },
}, { timestamps: true });
shiftAssignmentSchema.index({ companyId: 1, employeeId: 1, startDate: 1 });
exports.default = mongoose_1.default.models.ShiftAssignment || mongoose_1.default.model("ShiftAssignment", shiftAssignmentSchema, "shiftassignments");
