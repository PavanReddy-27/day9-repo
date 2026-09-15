import mongoose, { Schema, Document } from 'mongoose';

export type DLQResolution = 'unresolved' | 'retried' | 'discarded';

export interface IDeadLetterJob extends Document {
  originalJobId: mongoose.Types.ObjectId;
  type: string;
  payload: Record<string, any>;
  attempts: number;
  finalError: string;
  errorStack?: string;
  resolution: DLQResolution;
  failedAt: Date;
  retriedAt?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  notes?: string;
}

const DeadLetterJobSchema = new Schema<IDeadLetterJob>(
  {
    originalJobId: { type: Schema.Types.ObjectId, required: true, index: true },
    type: { type: String, required: true, index: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    attempts: { type: Number, required: true },
    finalError: { type: String, required: true },
    errorStack: { type: String },
    resolution: {
      type: String,
      enum: ['unresolved', 'retried', 'discarded'],
      default: 'unresolved',
      index: true,
    },
    failedAt: { type: Date, default: Date.now, index: true },
    retriedAt: { type: Date },
    resolvedAt: { type: Date },
    resolvedBy: { type: String },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

DeadLetterJobSchema.index({ resolution: 1, failedAt: -1 });

export const DeadLetterJob: mongoose.Model<IDeadLetterJob> =
  (mongoose.models.DeadLetterJob as any) ||
  mongoose.model<IDeadLetterJob>('DeadLetterJob', DeadLetterJobSchema);
export default DeadLetterJob;
