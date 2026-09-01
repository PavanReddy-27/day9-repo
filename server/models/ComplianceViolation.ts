import mongoose from 'mongoose';

const complianceViolationSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  ruleType: {
    type: String,
    required: true,
    enum: ['CROSS_COMPANY_ACCESS', 'UNAUTHORIZED_ACCESS', 'DATA_LEAK_ATTEMPT', 'EXCESSIVE_HOURS'],
  },
  description: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  ipAddress: String,
}, { timestamps: true });

export default mongoose.model('ComplianceViolation', complianceViolationSchema);
