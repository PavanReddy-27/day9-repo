"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCorrectionStatusSchema = exports.correctionSchema = exports.checkOutSchema = exports.checkInSchema = void 0;
var zod_1 = require("zod");
var locationSchema = zod_1.z.object({
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    accuracy: zod_1.z.number().optional(),
});
exports.checkInSchema = zod_1.z.object({
    location: locationSchema,
});
exports.checkOutSchema = zod_1.z.object({
    location: locationSchema,
});
exports.correctionSchema = zod_1.z.object({
    attendanceRecordId: zod_1.z.string().optional(),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD"),
    reason: zod_1.z.string().min(10, "Reason must be at least 10 characters long"),
    requestedCheckIn: zod_1.z.string().optional().nullable(),
    requestedCheckOut: zod_1.z.string().optional().nullable(),
}).refine(function (data) { return data.requestedCheckIn || data.requestedCheckOut; }, {
    message: "Must provide either requestedCheckIn or requestedCheckOut",
    path: ["requestedCheckIn"], // Assigning error to requestedCheckIn
});
exports.updateCorrectionStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["Approved", "Rejected"]),
});
