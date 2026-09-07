"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var eventBus_js_1 = require("../services/eventBus.js");
var performanceRecordSchema = new mongoose_1.default.Schema({
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    employeeId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    period: { type: String, required: true }, // e.g., "2026-Q1" or "2026-08"
    rating: { type: Number, required: true, min: 1, max: 5 },
    goalsCompleted: { type: Number, default: 0 },
    goalsAssigned: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
    reviewerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Employee", default: null },
}, { timestamps: true });
performanceRecordSchema.index({ companyId: 1, employeeId: 1, period: 1 }, { unique: true });
performanceRecordSchema.post('save', function (doc) {
    eventBus_js_1.eventBus.emit('analytics:update', {
        type: 'analytics_refresh',
        companyId: doc.companyId
    });
});
exports.default = mongoose_1.default.models.PerformanceRecord || mongoose_1.default.model("PerformanceRecord", performanceRecordSchema, "performancerecords");
