import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true, index: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    status: {
      type: String,
      required: true,
      enum: ["To Do", "In Progress", "Under Review", "Completed"],
      default: "To Do",
      index: true,
    },
    priority: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    dueDate: { type: Date, required: true },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.index({ companyId: 1, assignedTo: 1, status: 1 });

export default mongoose.models.Task || mongoose.model("Task", taskSchema, "tasks");
