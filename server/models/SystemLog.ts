import mongoose from 'mongoose';

const systemLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  level: { type: String, enum: ['info', 'warn', 'error', 'fatal'], required: true },
  category: { 
    type: String, 
    enum: ['Auth', 'Attendance', 'Notification', 'Database', 'BackgroundJob', 'System', 'API'],
    required: true,
    index: true
  },
  message: { type: String, required: true },
  
  // Context mapping
  reqId: { type: String, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
  
  // Additional structured metadata
  metadata: { type: mongoose.Schema.Types.Mixed },
  
  // Error specifics
  stack: { type: String },
}, { timestamps: true });

// TTL Index to automatically delete logs older than 30 days
systemLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const SystemLog = mongoose.model('SystemLog', systemLogSchema);

export default SystemLog;
