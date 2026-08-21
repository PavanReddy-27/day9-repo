import mongoose from "mongoose";
import { eventBus } from "../services/eventBus.js";

const employeeSkillSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", required: true, index: true },
    proficiencyLevel: { type: Number, required: true, min: 1, max: 5, default: 3 },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
  },
  { timestamps: true }
);

employeeSkillSchema.index({ companyId: 1, employeeId: 1, skillId: 1 }, { unique: true });

employeeSkillSchema.post('save', function(doc) {
  eventBus.emit('analytics:update', { 
    type: 'analytics_refresh', 
    companyId: doc.companyId 
  });
});

export default mongoose.models.EmployeeSkill || mongoose.model("EmployeeSkill", employeeSkillSchema, "employeeskills");
