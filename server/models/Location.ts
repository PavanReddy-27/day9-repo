import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  geofenceRadiusMeters: { type: Number, default: 500 },
  targetEmployeeCount: { type: Number },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

locationSchema.index({ companyId: 1 });

export default mongoose.models.Location || mongoose.model('Location', locationSchema);
