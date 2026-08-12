import mongoose from "mongoose";

const productivityRecordSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    date: { type: String, required: true, index: true }, // Format "YYYY-MM-DD"
    hoursLogged: { type: Number, required: true, default: 8 },
    tasksCompleted: { type: Number, default: 0 },
    efficiencyScore: { type: Number, default: 85 }, // Percentage 0-100
    idleTimeMinutes: { type: Number, default: 30 },
  },
  { timestamps: true }
);

productivityRecordSchema.index({ companyId: 1, employeeId: 1, date: 1 }, { unique: true });

export default mongoose.models.ProductivityRecord || mongoose.model("ProductivityRecord", productivityRecordSchema, "productivityrecords");
