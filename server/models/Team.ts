import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  name: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);
