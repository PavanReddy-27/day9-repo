"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var eventBus_js_1 = require("../services/eventBus.js");
var attendanceRecordSchema = new mongoose_1.default.Schema({
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    employeeId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    locationId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Location", required: true, index: true },
    date: { type: String, required: true, index: true }, // Format "YYYY-MM-DD"
    checkInTime: { type: Date, default: null },
    checkOutTime: { type: Date, default: null },
    workDurationMinutes: { type: Number, default: 0 },
    workingHours: { type: Number, default: 0 },
    breakDurationMinutes: { type: Number, default: 0 },
    breakStartTime: { type: Date, default: null },
    overtimeMinutes: { type: Number, default: 0 },
    lateMinutes: { type: Number, default: 0 },
    earlyDepartureMinutes: { type: Number, default: 0 },
    status: {
        type: String,
        required: true,
        enum: ["Not Checked In", "Working", "On Break", "Checked Out"],
        default: "Not Checked In",
        index: true,
    },
    shiftKind: { type: String, enum: ["Regular", "Flexible", "Night", "CrossMidnight"], default: "Regular" },
    isNightShift: { type: Boolean, default: false },
    workMode: { type: String, enum: ["Office", "WFH"], default: "Office" },
    checkInCoordinates: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null }
    },
    // Persist the check-OUT GPS reading too, so history can show both the
    // check-in and check-out locations. Without this field Mongoose strict mode
    // silently drops the checkOutCoordinates the controller sets.
    checkOutCoordinates: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null }
    }
}, { timestamps: true });
attendanceRecordSchema.index({ companyId: 1, employeeId: 1, date: 1 }, { unique: true });
attendanceRecordSchema.index({ companyId: 1, date: 1, status: 1 });
attendanceRecordSchema.post('save', function (doc) {
    eventBus_js_1.eventBus.emit('analytics:update', {
        type: 'analytics_refresh',
        companyId: doc.companyId
    });
});
exports.default = mongoose_1.default.models.AttendanceRecord || mongoose_1.default.model("AttendanceRecord", attendanceRecordSchema, "attendancerecords");
