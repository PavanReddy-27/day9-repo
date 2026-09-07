"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var eventBus_js_1 = require("../services/eventBus.js");
// Field names here match what is actually stored in the `employees` collection
// (companyId/locationId/departmentId-style refs), not the older `company`/`location`
// naming used by server/seed.ts. See server/README or the Task 14 handoff notes:
// server/seed.ts still writes the old field names and needs to be updated to match.
var employeeSchema = new mongoose_1.default.Schema({
    employeeId: { type: String, required: true, unique: true },
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Company', required: true },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fullName: { type: String, required: true },
    avatar: { type: String },
    locationId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Location', required: true },
    locationCode: { type: String },
    departmentId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Department', required: true },
    departmentName: { type: String },
    teamId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Team' },
    managerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Employee' },
    shiftId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Shift' },
    role: { type: String, enum: ['Admin', 'HR', 'Manager', 'Employee'], required: true },
    designation: { type: String },
    workMode: { type: String, enum: ['Office', 'Remote', 'Hybrid'], default: 'Office' },
    employmentStatus: { type: String, enum: ['Active', 'Inactive', 'On Leave', 'Notice Period'], default: 'Active' },
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
    joiningDate: { type: Date, required: true },
}, { timestamps: true });
employeeSchema.index({ companyId: 1, locationId: 1 });
employeeSchema.index({ companyId: 1, departmentId: 1 });
employeeSchema.post('save', function (doc) {
    eventBus_js_1.eventBus.emit('analytics:update', {
        type: 'analytics_refresh',
        companyId: doc.companyId
    });
});
var Employee = mongoose_1.default.models.Employee || mongoose_1.default.model('Employee', employeeSchema);
exports.default = Employee;
