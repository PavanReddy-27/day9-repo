import mongoose from "mongoose";

const shiftSwapSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    requestorId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    targetEmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    requestorShiftId: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", required: true },
    targetShiftId: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  },
  { timestamps: true }
);

shiftSwapSchema.index({ companyId: 1, date: 1 });

export default mongoose.models.ShiftSwap || mongoose.model("ShiftSwap", shiftSwapSchema, "shiftswaps");
