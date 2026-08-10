import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    headEmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

departmentSchema.index({ companyId: 1, locationId: 1, code: 1 }, { unique: true });

export default mongoose.models.Department || mongoose.model("Department", departmentSchema, "departments");
