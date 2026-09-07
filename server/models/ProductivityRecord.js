"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var eventBus_js_1 = require("../services/eventBus.js");
var productivityRecordSchema = new mongoose_1.default.Schema({
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    employeeId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    date: { type: String, required: true, index: true }, // Format "YYYY-MM-DD"
    hoursLogged: { type: Number, required: true, default: 8 },
    tasksCompleted: { type: Number, default: 0 },
    efficiencyScore: { type: Number, default: 85 }, // Percentage 0-100
    idleTimeMinutes: { type: Number, default: 30 },
}, { timestamps: true });
productivityRecordSchema.index({ companyId: 1, employeeId: 1, date: 1 }, { unique: true });
productivityRecordSchema.post('save', function (doc) {
    eventBus_js_1.eventBus.emit('analytics:update', {
        type: 'analytics_refresh',
        companyId: doc.companyId
    });
});
exports.default = mongoose_1.default.models.ProductivityRecord || mongoose_1.default.model("ProductivityRecord", productivityRecordSchema, "productivityrecords");
