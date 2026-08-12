import mongoose from "mongoose";

const approvalHistorySchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    correctionRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "CorrectionRequest", required: true, index: true },
    action: { type: String, required: true, enum: ["Submitted", "Approved", "Rejected"] },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    previousStatus: { type: String, required: true },
    newStatus: { type: String, required: true },
    comments: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

approvalHistorySchema.index({ companyId: 1, correctionRequestId: 1, timestamp: 1 });

export default mongoose.models.ApprovalHistory || mongoose.model("ApprovalHistory", approvalHistorySchema, "approvalhistories");
