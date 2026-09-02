"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var taskSchema = new mongoose_1.default.Schema({
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    assignedTo: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    assignedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Employee", required: true },
    departmentId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Department", required: true, index: true },
    teamId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    status: {
        type: String,
        required: true,
        enum: ["To Do", "In Progress", "Under Review", "Completed"],
        default: "To Do",
        index: true,
    },
    priority: {
        type: String,
        required: true,
        enum: ["Low", "Medium", "High", "Critical"],
        default: "Medium",
    },
    dueDate: { type: Date, required: true },
    completedAt: { type: Date, default: null },
}, { timestamps: true });
taskSchema.index({ companyId: 1, assignedTo: 1, status: 1 });
exports.default = mongoose_1.default.models.Task || mongoose_1.default.model("Task", taskSchema, "tasks");
