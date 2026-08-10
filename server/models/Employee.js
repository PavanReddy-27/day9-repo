import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    employeeId: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true, index: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true, index: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null, index: true },
    
    role: { type: String, required: true, enum: ["Admin", "HR", "Manager", "Team Lead", "Employee"] },
    designation: { type: String, required: true, trim: true },
    workMode: { type: String, required: true, enum: ["Office", "Remote", "Hybrid"], default: "Office" },
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", default: null },
    
    joinDate: { type: Date, required: true },
    employmentStatus: { type: String, enum: ["Active", "On Leave", "Terminated"], default: "Active", index: true },
    riskLevel: { type: String, enum: ["Low", "Medium", "High"], default: "Low", index: true },
    avatarUrl: { type: String, default: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
  },
  { timestamps: true }
);

employeeSchema.index({ companyId: 1, employeeId: 1 }, { unique: true });
employeeSchema.index({ companyId: 1, email: 1 }, { unique: true });
employeeSchema.index({ companyId: 1, locationId: 1, departmentId: 1 });

export default mongoose.models.Employee || mongoose.model("Employee", employeeSchema, "employees");
