import mongoose from "mongoose";
import { eventBus } from "../services/eventBus.js";

const performanceRecordSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    period: { type: String, required: true }, // e.g., "2026-Q1" or "2026-08"
    rating: { type: Number, required: true, min: 1, max: 5 },
    goalsCompleted: { type: Number, default: 0 },
    goalsAssigned: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
  },
  { timestamps: true }
);

performanceRecordSchema.index({ companyId: 1, employeeId: 1, period: 1 }, { unique: true });

performanceRecordSchema.post('save', function(doc) {
  eventBus.emit('analytics:update', { 
    type: 'analytics_refresh', 
    companyId: doc.companyId 
  });
});

export default mongoose.models.PerformanceRecord || mongoose.model("PerformanceRecord", performanceRecordSchema, "performancerecords");
