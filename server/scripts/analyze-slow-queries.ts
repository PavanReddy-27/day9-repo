import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models to ensure they are registered
import AttendanceRecord from '../models/AttendanceRecord.js';
import PayrollRecord from '../models/PayrollRecord.js';
import LeaveRequest from '../models/LeaveRequest.js';
import AuditLog from '../models/AuditLog.js';

async function runAnalysis() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Mongoose set profiling level to track slow queries natively
    // We can also run an explain plan manually.
    console.log('\n--- Analyzing AttendanceRecord ---');
    const attendanceExplain = await AttendanceRecord.find({ 
      companyId: new mongoose.Types.ObjectId(), 
      date: '2023-10-01' 
    }).explain('executionStats');
    console.log(`Index used: ${attendanceExplain[0]?.queryPlanner?.winningPlan?.inputStage?.indexName || 'COLLSCAN'}`);
    console.log(`Execution time: ${attendanceExplain[0]?.executionStats?.executionTimeMillis}ms`);

    console.log('\n--- Analyzing PayrollRecord ---');
    const payrollExplain = await PayrollRecord.find({ 
      companyId: new mongoose.Types.ObjectId(),
      periodId: new mongoose.Types.ObjectId(),
      employeeId: new mongoose.Types.ObjectId()
    }).explain('executionStats');
    console.log(`Index used: ${payrollExplain[0]?.queryPlanner?.winningPlan?.inputStage?.indexName || 'COLLSCAN'}`);
    console.log(`Execution time: ${payrollExplain[0]?.executionStats?.executionTimeMillis}ms`);

    console.log('\n--- Analyzing LeaveRequest ---');
    const leaveExplain = await LeaveRequest.find({ 
      companyId: new mongoose.Types.ObjectId(),
      status: 'Pending'
    }).sort({ startDate: -1 }).explain('executionStats');
    console.log(`Index used: ${leaveExplain[0]?.queryPlanner?.winningPlan?.inputStage?.indexName || 'COLLSCAN'}`);
    console.log(`Execution time: ${leaveExplain[0]?.executionStats?.executionTimeMillis}ms`);

    console.log('\n--- Analyzing AuditLog ---');
    const auditExplain = await AuditLog.find({
      companyId: new mongoose.Types.ObjectId()
    }).sort({ timestamp: -1 }).explain('executionStats');
    console.log(`Index used: ${auditExplain[0]?.queryPlanner?.winningPlan?.inputStage?.indexName || 'COLLSCAN'}`);
    console.log(`Execution time: ${auditExplain[0]?.executionStats?.executionTimeMillis}ms`);

  } catch (error) {
    console.error('Error running analysis:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
}

runAnalysis();
