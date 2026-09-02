"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var approvalHistorySchema = new mongoose_1.default.Schema({
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    correctionRequestId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "CorrectionRequest", required: true, index: true },
    action: { type: String, required: true, enum: ["Submitted", "Approved", "Rejected"] },
    performedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Employee", required: true },
    previousStatus: { type: String, required: true },
    newStatus: { type: String, required: true },
    comments: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });
approvalHistorySchema.index({ companyId: 1, correctionRequestId: 1, timestamp: 1 });
exports.default = mongoose_1.default.models.ApprovalHistory || mongoose_1.default.model("ApprovalHistory", approvalHistorySchema, "approvalhistories");
