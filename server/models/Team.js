import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    teamLeadId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
  },
  { timestamps: true }
);

teamSchema.index({ companyId: 1, departmentId: 1, code: 1 }, { unique: true });

export default mongoose.models.Team || mongoose.model("Team", teamSchema, "teams");
