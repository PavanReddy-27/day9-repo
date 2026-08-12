import mongoose from "mongoose";

const shiftAssignmentSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    status: { type: String, enum: ["Active", "Historical", "Cancelled"], default: "Active" },
  },
  { timestamps: true }
);

shiftAssignmentSchema.index({ companyId: 1, employeeId: 1, startDate: 1 });

export default mongoose.models.ShiftAssignment || mongoose.model("ShiftAssignment", shiftAssignmentSchema, "shiftassignments");
