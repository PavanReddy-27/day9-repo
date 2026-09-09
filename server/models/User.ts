import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // Prevents password from being returned in queries by default
  },
  role: {
    type: String,
    enum: ['Admin', 'HR', 'Manager', 'Team Lead', 'Employee'],
    default: 'Employee',
  },
  mfaSecret: {
    type: String,
    select: false,
  },
  mfaEnabled: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  // Prevent double-hashing if the password is already a bcrypt hash
  if (this.password.startsWith('$2')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (this.password && this.password.startsWith('$argon2')) {
    throw new Error('Argon2 passwords are no longer supported. Please reset your password.');
  }
  return bcrypt.compare(enteredPassword, this.password);
};

export const User = (mongoose.models.User || mongoose.model('User', userSchema)) as mongoose.Model<any>;
export const AdminAuth = (mongoose.models.AdminAuth || mongoose.model('AdminAuth', userSchema)) as mongoose.Model<any>;
export const HRAuth = (mongoose.models.HRAuth || mongoose.model('HRAuth', userSchema)) as mongoose.Model<any>;
export const ManagerAuth = (mongoose.models.ManagerAuth || mongoose.model('ManagerAuth', userSchema)) as mongoose.Model<any>;
export const TeamLeadAuth = (mongoose.models.TeamLeadAuth || mongoose.model('TeamLeadAuth', userSchema)) as mongoose.Model<any>;
export const EmployeeAuth = (mongoose.models.EmployeeAuth || mongoose.model('EmployeeAuth', userSchema)) as mongoose.Model<any>;
