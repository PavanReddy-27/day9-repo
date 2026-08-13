import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as argon2 from 'argon2';

const userSchema = new mongoose.Schema({
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
    enum: ['Admin', 'HR', 'Manager', 'Employee'],
    default: 'Employee',
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (this.password && this.password.startsWith('$argon2')) {
    return await argon2.verify(this.password, enteredPassword);
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
export const AdminAuth = mongoose.model('AdminAuth', userSchema);
export const HRAuth = mongoose.model('HRAuth', userSchema);
export const ManagerAuth = mongoose.model('ManagerAuth', userSchema);
export const EmployeeAuth = mongoose.model('EmployeeAuth', userSchema);
