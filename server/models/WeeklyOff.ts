import mongoose from "mongoose";

const weeklyOffSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, // 0=Sunday, 6=Saturday
  },
  { timestamps: true }
);

weeklyOffSchema.index({ companyId: 1, employeeId: 1, dayOfWeek: 1 }, { unique: true });

export default mongoose.models.WeeklyOff || mongoose.model("WeeklyOff", weeklyOffSchema, "weeklyoffs");
