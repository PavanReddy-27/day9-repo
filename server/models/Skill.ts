import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true }, // e.g. "Frontend", "Backend", "HR", "Finance"
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

skillSchema.index({ companyId: 1, name: 1 }, { unique: true });

export default mongoose.models.Skill || mongoose.model("Skill", skillSchema, "skills");
