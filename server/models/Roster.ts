import mongoose from "mongoose";

const rosterSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["Published", "Draft", "Archived"], default: "Published" },
  },
  { timestamps: true }
);

rosterSchema.index({ companyId: 1, employeeId: 1, startDate: 1 });

export default mongoose.models.Roster || mongoose.model("Roster", rosterSchema, "rosters");
