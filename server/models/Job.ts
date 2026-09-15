import mongoose, { Schema, Document } from 'mongoose';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IJob extends Document {
  type: string;
  payload: Record<string, any>;
  status: JobStatus;
  priority: number;
  attempts: number;
  maxRetries: number;
  lastError?: string;
  errorStack?: string;
  runAt: Date;
  nextRunAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    type: { type: String, required: true, index: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    priority: { type: Number, default: 0, index: true },
    attempts: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    lastError: { type: String },
    errorStack: { type: String },
    runAt: { type: Date, default: Date.now, index: true },
    nextRunAt: { type: Date, default: Date.now, index: true },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient worker polling
JobSchema.index({ status: 1, nextRunAt: 1, priority: -1 });

export const Job: mongoose.Model<IJob> = (mongoose.models.Job as any) || mongoose.model<IJob>('Job', JobSchema);
export default Job;
