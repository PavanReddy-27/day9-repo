import mongoose from "mongoose";

const idempotencyRecordSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    idempotencyKey: { type: String, required: true, index: true },
    requestPath: { type: String, required: true },
    requestHash: { type: String, default: "" },
    responseStatus: { type: Number, required: true },
    responseBody: { type: mongoose.Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // Auto TTL index
  },
  { timestamps: true }
);

idempotencyRecordSchema.index({ companyId: 1, idempotencyKey: 1 }, { unique: true });

export default mongoose.models.IdempotencyRecord || mongoose.model("IdempotencyRecord", idempotencyRecordSchema, "idempotencyrecords");
