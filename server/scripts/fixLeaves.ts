import mongoose from 'mongoose';
import connectDB, { closeDB } from '../config/db.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Employee from '../models/Employee.js';

const run = async () => {
  await connectDB();
  console.log('Clearing old leave records...');
  const delRes = await LeaveRequest.deleteMany({});
  console.log(`Deleted ${delRes.deletedCount} old leave records.`);

  console.log('Generating day to day leave records...');
  
  // Get some employees
  const employees = await Employee.find().limit(30);
  if (employees.length === 0) {
    console.log('No employees found to generate leaves.');
    await closeDB();
    return;
  }

  const types = ["Annual", "Sick", "Casual", "Unpaid"];
  const statuses = ["Pending", "Approved", "Rejected"];
  
  const leavePromises = [];
  
  for (let i = 0; i < 20; i++) {
    const emp = employees[i % employees.length];
    
    // Generate dates around today
    const now = new Date();
    const offsetDays = Math.floor(Math.random() * 20) - 10; // -10 to +10 days
    const duration = Math.floor(Math.random() * 3) + 1; // 1 to 3 days
    
    const startDate = new Date(now);
    startDate.setDate(now.getDate() + offsetDays);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + duration - 1);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    leavePromises.push(LeaveRequest.create({
      companyId: emp.companyId,
      employeeId: emp._id,
      type,
      startDate: startDateStr,
      endDate: endDateStr,
      durationDays: duration,
      reason: `Need ${type.toLowerCase()} leave for personal reasons.`,
      status,
      reviewedBy: status !== 'Pending' ? employees[0]._id : null,
      reviewedAt: status !== 'Pending' ? new Date() : null,
      createdAt: new Date(startDate.getTime() - 2 * 24 * 60 * 60 * 1000)
    }));
  }
  
  await Promise.all(leavePromises);
  console.log(`Created ${leavePromises.length} new realistic day-to-day leave records.`);
  
  await closeDB();
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
