import mongoose, { Schema, Document } from 'mongoose';

export interface IPayrollRecord extends Document {
  companyId: mongoose.Types.ObjectId;
  periodId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  payableDays: number;
  regularHours: number;
  overtimeHours: number;
  unpaidLeaveDays: number;
  baseSalary: number;
  shiftAllowance: number;
  deductions: number;
  netSalary: number;
  status: 'Draft' | 'Adjusted' | 'Approved';
  adjustments: Array<{
    type: 'addition' | 'deduction';
    amount: number;
    reason: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const PayrollRecordSchema: Schema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    periodId: { type: Schema.Types.ObjectId, ref: 'PayrollPeriod', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    payableDays: { type: Number, default: 0 },
    regularHours: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    unpaidLeaveDays: { type: Number, default: 0 },
    baseSalary: { type: Number, default: 0 },
    shiftAllowance: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },
    status: { type: String, enum: ['Draft', 'Adjusted', 'Approved'], default: 'Draft' },
    adjustments: [
      {
        type: { type: String, enum: ['addition', 'deduction'] },
        amount: Number,
        reason: String
      }
    ]
  },
  { timestamps: true }
);

export default (mongoose.models.PayrollRecord || mongoose.model<IPayrollRecord>('PayrollRecord', PayrollRecordSchema)) as mongoose.Model<IPayrollRecord>;

