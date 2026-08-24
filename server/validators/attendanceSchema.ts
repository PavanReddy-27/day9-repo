import { z } from "zod";

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
}).passthrough();

export const checkInSchema = z.object({
  location: locationSchema.optional().nullable(),
  source: z.string().optional(),
  shiftType: z.enum(["Regular", "Night", "CrossMidnight", "Flexible"]).optional(),
  idempotencyKey: z.string().optional(),
  isWFH: z.boolean().optional(),
  workMode: z.string().optional(),
}).passthrough();

export const checkOutSchema = z.object({
  location: locationSchema.optional().nullable(),
  idempotencyKey: z.string().optional(),
}).passthrough();

export const breakSchema = z.object({
  idempotencyKey: z.string().optional(),
}).passthrough();

export const correctionSchema = z.object({
  attendanceRecordId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD"),
  reason: z.string().min(10, "Reason must be at least 10 characters long"),
  requestedCheckIn: z.string().optional().nullable(),
  requestedCheckOut: z.string().optional().nullable(),
}).refine(data => data.requestedCheckIn || data.requestedCheckOut, {
  message: "Must provide either requestedCheckIn or requestedCheckOut",
  path: ["requestedCheckIn"],
});

export const updateCorrectionStatusSchema = z.object({
  status: z.enum(["Approved", "Rejected"]),
});
