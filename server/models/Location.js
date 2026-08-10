import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    radiusMeters: { type: Number, default: 500 },
    targetEmployeeCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

locationSchema.index({ companyId: 1, code: 1 }, { unique: true });

export default mongoose.models.Location || mongoose.model("Location", locationSchema, "locations");
