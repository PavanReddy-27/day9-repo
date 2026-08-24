import mongoose from 'mongoose';
import { eventBus } from '../services/eventBus.js';

// Field names here match what is actually stored in the `employees` collection
// (companyId/locationId/departmentId-style refs), not the older `company`/`location`
// naming used by server/seed.ts. See server/README or the Task 14 handoff notes:
// server/seed.ts still writes the old field names and needs to be updated to match.
const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  fullName: { type: String, required: true },
  avatar: { type: String },

  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  locationCode: { type: String },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  departmentName: { type: String },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },

  role: { type: String, enum: ['Admin', 'HR', 'Manager', 'Employee'], required: true },
  designation: { type: String },
  workMode: { type: String, enum: ['Office', 'Remote', 'Hybrid'], default: 'Office' },
  employmentStatus: { type: String, enum: ['Active', 'Inactive', 'On Leave', 'Notice Period'], default: 'Active' },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },

  joiningDate: { type: Date, required: true },
}, { timestamps: true });

employeeSchema.index({ companyId: 1, locationId: 1 });
employeeSchema.index({ companyId: 1, departmentId: 1 });

employeeSchema.post('save', function(doc) {
  eventBus.emit('analytics:update', { 
    type: 'analytics_refresh', 
    companyId: doc.companyId 
  });
});

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
export default Employee as typeof mongoose.Model;
