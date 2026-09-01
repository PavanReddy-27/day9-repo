import { z } from "zod";

export const leaveSchema = z.object({
  body: z.object({
    type: z.string({ required_error: "Leave type is required" }),
    startDate: z.string({ required_error: "Start date is required" }).regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD"),
    endDate: z.string({ required_error: "End date is required" }).regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD"),
    reason: z.string({ required_error: "Reason is required" }),
  }),
});
