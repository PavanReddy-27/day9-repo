import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    domain: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    settings: {
      defaultGeofenceRadiusMeters: { type: Number, default: 500 },
      timezone: { type: String, default: "Asia/Kolkata" },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Company || mongoose.model("Company", companySchema, "companies");
