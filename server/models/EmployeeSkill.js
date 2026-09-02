"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var eventBus_js_1 = require("../services/eventBus.js");
var employeeSkillSchema = new mongoose_1.default.Schema({
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    employeeId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    skillId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Skill", required: true, index: true },
    proficiencyLevel: { type: Number, required: true, min: 1, max: 5, default: 3 },
    verifiedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Employee", default: null },
}, { timestamps: true });
employeeSkillSchema.index({ companyId: 1, employeeId: 1, skillId: 1 }, { unique: true });
employeeSkillSchema.post('save', function (doc) {
    eventBus_js_1.eventBus.emit('analytics:update', {
        type: 'analytics_refresh',
        companyId: doc.companyId
    });
});
exports.default = mongoose_1.default.models.EmployeeSkill || mongoose_1.default.model("EmployeeSkill", employeeSkillSchema, "employeeskills");
