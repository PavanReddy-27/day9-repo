import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["Admin", "HR", "Manager", "Team Lead", "Employee"],
    },
    description: {
      type: String,
      required: true,
    },
    permissions: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export default (mongoose.models.Role || mongoose.model("Role", roleSchema)) as mongoose.Model<any>;
