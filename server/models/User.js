import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    employeeId: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "HR", "Manager", "Team Lead", "Employee"],
      index: true,
    },
    isActive: { type: Boolean, default: true },
    refreshTokenHash: { type: String, default: null, select: false },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.index({ companyId: 1, email: 1 }, { unique: true });
userSchema.index({ companyId: 1, employeeId: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model("User", userSchema, "users");
