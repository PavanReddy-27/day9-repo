import { z } from "zod";

export const leaveSchema = z.union([
  z.object({
    type: z.string().min(1, "Leave type is required"),
    startDate: z.string().min(1, "Start date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD"),
    endDate: z.string().min(1, "End date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD"),
    reason: z.string().min(1, "Reason is required"),
  }).passthrough(),
  z.object({
    body: z.object({
      type: z.string().min(1, "Leave type is required"),
      startDate: z.string().min(1, "Start date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD"),
      endDate: z.string().min(1, "End date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD"),
      reason: z.string().min(1, "Reason is required"),
    }).passthrough(),
  }).passthrough(),
]);
