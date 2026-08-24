import mongoose from "mongoose";
import { eventBus } from "../services/eventBus.js";

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

productivityRecordSchema.post('save', function(doc) {
  eventBus.emit('analytics:update', { 
    type: 'analytics_refresh', 
    companyId: doc.companyId 
  });
});

export default mongoose.models.ProductivityRecord || mongoose.model("ProductivityRecord", productivityRecordSchema, "productivityrecords");
