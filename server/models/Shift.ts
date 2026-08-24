import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["General", "Morning", "Afternoon", "Night", "Regular", "Flexible", "CrossMidnight"],
      default: "General",
    },
    startTime: { type: String, required: true }, // Format "HH:mm" e.g., "09:00"
    endTime: { type: String, required: true },   // Format "HH:mm" e.g., "17:00"
    breakDurationMinutes: { type: Number, default: 60 },
    workDurationMinutes: { type: Number, default: 480 },
    workingHours: { type: Number, default: 8 },
  },
  { timestamps: true }
);

shiftSchema.index({ companyId: 1, code: 1 }, { unique: true });

export default mongoose.models.Shift || mongoose.model("Shift", shiftSchema, "shifts");
