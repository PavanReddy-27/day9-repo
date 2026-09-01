import mongoose, { Schema, Document } from 'mongoose';

export interface IPayrollPeriod extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'Draft' | 'Review' | 'Locked';
  lockedBy?: mongoose.Types.ObjectId;
  lockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PayrollPeriodSchema: Schema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['Draft', 'Review', 'Locked'], default: 'Draft' },
    lockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lockedAt: { type: Date }
  },
  { timestamps: true }
);

export default (mongoose.models.PayrollPeriod || mongoose.model<IPayrollPeriod>('PayrollPeriod', PayrollPeriodSchema)) as mongoose.Model<IPayrollPeriod>;

