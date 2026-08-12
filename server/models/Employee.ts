import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  avatar: { type: String },

  // References
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },

  role: { type: String, required: true },
  designation: { type: String, required: true },
  employmentType: { type: String, enum: ['Permanent', 'Contract', 'Intern', 'Consultant'], default: 'Permanent' },
  status: { type: String, enum: ['Active', 'Inactive', 'On Leave', 'Notice Period'], default: 'Active' },
  risk: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },

  joiningDate: { type: Date, required: true },
  confirmationDate: { type: Date },

  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  age: { type: Number },
  
  salary: { type: Number },
  bonus: { type: Number },
  experience: { type: Number },

  performanceScore: { type: Number, min: 0, max: 100 },
  engagementScore: { type: Number, min: 0, max: 100 },
  attendancePercentage: { type: Number, min: 0, max: 100 },
  trainingCompletion: { type: Number, min: 0, max: 100 },
  skillCoverage: { type: Number, min: 0, max: 100 },
  promotionCount: { type: Number, default: 0 },
  
  project: { type: String },
}, { timestamps: true });

export default mongoose.model('Employee', employeeSchema);
