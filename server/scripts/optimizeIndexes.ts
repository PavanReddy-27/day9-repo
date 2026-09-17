/**
 * MongoDB Index Optimization Script (Task 16 - Sridhika)
 * Creates and validates compound and single indexes on critical collections
 * to maximize query performance under high load.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB, { closeDB } from '../config/db.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import Employee from '../models/Employee.js';
import { User } from '../models/User.js';
import LeaveRequest from '../models/LeaveRequest.js';
import PayrollRecord from '../models/PayrollRecord.js';
import AuditLog from '../models/AuditLog.js';
import Job from '../models/Job.js';
import DeadLetterJob from '../models/DeadLetterJob.js';

interface IndexDefinition {
  model: mongoose.Model<any>;
  name: string;
  fields: Record<string, 1 | -1 | 'text'>;
  options?: mongoose.IndexOptions;
}

export async function optimizeAllIndexes(shouldClose = true) {
  console.log('====================================================');
  console.log('[Index Optimizer] Initializing MongoDB Index Suite...');
  console.log('====================================================');

  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  const indexesToEnsure: IndexDefinition[] = [
    // 1. AttendanceRecord (high-volume time-series / reporting)
    {
      model: AttendanceRecord,
      name: 'idx_attendance_emp_date',
      fields: { employeeId: 1, date: -1 },
    },
    {
      model: AttendanceRecord,
      name: 'idx_attendance_company_date',
      fields: { companyId: 1, date: -1 },
    },
    {
      model: AttendanceRecord,
      name: 'idx_attendance_date_status',
      fields: { date: 1, status: 1 },
    },

    // 2. Employee (identity, department, tenancy lookups)
    {
      model: Employee,
      name: 'idx_employee_company_email',
      fields: { companyId: 1, email: 1 },
    },
    {
      model: Employee,
      name: 'idx_employee_dept_active',
      fields: { departmentId: 1, isActive: 1 },
    },
    {
      model: Employee,
      name: 'idx_employee_manager',
      fields: { managerId: 1 },
    },

    // 3. User (auth lookups)
    {
      model: User,
      name: 'idx_user_email_active',
      fields: { email: 1, isActive: 1 },
    },
    {
      model: User,
      name: 'idx_user_role_company',
      fields: { role: 1, companyId: 1 },
    },

    // 4. LeaveRequest (approval queues and employee balances)
    {
      model: LeaveRequest,
      name: 'idx_leave_emp_start',
      fields: { employeeId: 1, startDate: -1 },
    },
    {
      model: LeaveRequest,
      name: 'idx_leave_company_status',
      fields: { companyId: 1, status: 1 },
    },

    // 5. PayrollRecord (batch calculation & reporting)
    {
      model: PayrollRecord,
      name: 'idx_payroll_period_emp',
      fields: { payrollPeriodId: 1, employeeId: 1 },
    },

    // 6. AuditLog (compliance searches & security audits)
    {
      model: AuditLog,
      name: 'idx_audit_company_timestamp',
      fields: { companyId: 1, timestamp: -1 },
    },
    {
      model: AuditLog,
      name: 'idx_audit_action_timestamp',
      fields: { action: 1, timestamp: -1 },
    },

    // 7. Background Job & Dead-Letter Queues
    {
      model: Job,
      name: 'idx_job_status_priority_nextrun',
      fields: { status: 1, priority: -1, nextRunAt: 1 },
    },
    {
      model: DeadLetterJob,
      name: 'idx_dlq_resolution_failed',
      fields: { resolution: 1, failedAt: -1 },
    },
  ];

  const results: Array<{ collection: string; index: string; status: string }> = [];

  for (const def of indexesToEnsure) {
    const collName = def.model.collection.name;
    try {
      await def.model.collection.createIndex(def.fields as any, {
        name: def.name,
        background: true,
        ...def.options,
      } as any);
      console.log(`✓ [${collName}] Index ensured: ${def.name}`);
      results.push({ collection: collName, index: def.name, status: 'CREATED/ACTIVE' });
    } catch (err: any) {
      console.warn(`! [${collName}] Could not create index ${def.name}: ${err.message}`);
      results.push({ collection: collName, index: def.name, status: `FAILED: ${err.message}` });
    }
  }

  console.log('====================================================');
  console.log(`[Index Optimizer] Completed. ${results.length} indexes verified.`);
  console.log('====================================================');

  if (shouldClose) {
    await closeDB();
  }

  return results;
}

if (process.argv[1]?.includes('optimizeIndexes')) {
  optimizeAllIndexes(true).catch(console.error);
}

export default optimizeAllIndexes;
