import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.model('Location', locationSchema);
