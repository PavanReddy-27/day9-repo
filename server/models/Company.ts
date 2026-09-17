import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
}, { timestamps: true });

export default (mongoose.models.Company || mongoose.model('Company', companySchema)) as mongoose.Model<any>;
