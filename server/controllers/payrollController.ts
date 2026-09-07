import { Request, Response } from 'express';
import PayrollPeriod from '../models/PayrollPeriod.js';
import PayrollRecord from '../models/PayrollRecord.js';
import Employee from '../models/Employee.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Papa from 'papaparse';

// Calculate Payroll for a Period
export const calculatePayroll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, startDate, endDate } = req.body;
    const companyId = req.body.companyId || (req as any).companyId;
    console.log("CALCULATING PAYROLL", { companyId, bodyCompanyId: req.body.companyId, reqCompanyId: (req as any).companyId });
    
    // Check if period already exists
    let period = await PayrollPeriod.findOne({ companyId, name });
    if (!period) {
      period = await PayrollPeriod.create({ companyId, name, startDate, endDate });
    } else {
      if (period.status === 'Locked') {
        res.status(400).json({ error: 'Cannot recalculate a locked payroll period.' });
        return;
      }
    }

    // Fetch all active employees
    const employees = await Employee.find({ companyId, employmentStatus: { $in: ['Active', 'Notice Period'] } });
    console.log(`FOUND ${employees.length} EMPLOYEES FOR COMPANY ${companyId}`);

    const employeeIds = employees.map(emp => emp._id);

    // 1. Fetch all Approved Attendances for these employees in this period
    const attendances = await AttendanceRecord.find({
      employeeId: { $in: employeeIds },
      date: { $gte: new Date(startDate).toISOString().split('T')[0], $lte: new Date(endDate).toISOString().split('T')[0] },
      status: 'Checked Out' // only valid/completed attendance
    } as any);

    // Group attendances by employee
    const attByEmp: Record<string, any[]> = {};
    for (const att of attendances) {
      const eid = att.employeeId.toString();
      if (!attByEmp[eid]) attByEmp[eid] = [];
      attByEmp[eid].push(att);
    }

    // 2. Fetch all Unpaid Leaves for these employees
    const leaves = await LeaveRequest.find({
      employeeId: { $in: employeeIds },
      status: 'Approved',
      type: 'Unpaid',
      $or: [
        { startDate: { $lte: endDate, $gte: startDate } },
        { endDate: { $lte: endDate, $gte: startDate } }
      ]
    } as any);

    // Group leaves by employee
    const leavesByEmp: Record<string, any[]> = {};
    for (const leave of leaves) {
      const eid = leave.employeeId.toString();
      if (!leavesByEmp[eid]) leavesByEmp[eid] = [];
      leavesByEmp[eid].push(leave);
    }

    // 3. Prepare Bulk Operations
    const bulkOps = [];
    
    for (const emp of employees) {
      const eid = emp._id.toString();
      
      const empAttendances = attByEmp[eid] || [];
      let regularHours = 0;
      let overtimeHours = 0;
      let shiftAllowance = 0;
      const payableDays = empAttendances.length;

      for (const att of empAttendances) {
        regularHours += att.workingHours || 0;
        overtimeHours += (att.overtimeMinutes || 0) / 60;
        
        if (att.isNightShift) {
          shiftAllowance += 500; // Flat 500 for night shift per day
        }
      }

      const empLeaves = leavesByEmp[eid] || [];
      let unpaidLeaveDays = 0;
      for (const leave of empLeaves) {
        unpaidLeaveDays += leave.durationDays || 0;
      }

      // 3. Base Salary & Deductions
      const baseSalary = emp.salary || 0;
      const dailyRate = baseSalary / 30; // approx
      const deductions = unpaidLeaveDays * dailyRate;
      
      const overtimePay = overtimeHours * (dailyRate / 8) * 1.5;
      
      const netSalary = baseSalary + shiftAllowance + overtimePay - deductions;

      // Prepare bulk upsert op
      bulkOps.push({
        updateOne: {
          filter: { periodId: period._id, employeeId: emp._id },
          update: {
            $set: {
              companyId,
              payableDays,
              regularHours,
              overtimeHours,
              unpaidLeaveDays,
              baseSalary,
              shiftAllowance,
              deductions,
              netSalary,
              status: 'Draft'
            }
          },
          upsert: true
        }
      });
    }

    // Execute bulk write if there are employees
    if (bulkOps.length > 0) {
      await PayrollRecord.bulkWrite(bulkOps);
    }

    res.status(200).json({ message: 'Payroll calculated successfully', period, count: employees.length });
  } catch (error) {
    console.error('Calculate Payroll Error:', error);
    res.status(500).json({ error: 'Failed to calculate payroll' });
  }
};

// Review & Adjust Payroll
export const adjustPayrollRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recordId } = req.params;
    const { 
      payableDays, 
      regularHours, 
      overtimeHours, 
      unpaidLeaveDays, 
      baseSalary, 
      shiftAllowance, 
      deductions,
      type,
      amount,
      reason
    } = req.body;

    const record = await PayrollRecord.findById(recordId).populate('periodId');
    if (!record) {
      res.status(404).json({ error: 'Payroll record not found' });
      return;
    }

    const period = record.periodId as any;
    if (period.status === 'Locked') {
      res.status(400).json({ error: 'Cannot adjust a locked payroll period.' });
      return;
    }

    // Manual override of fields
    if (payableDays !== undefined) record.payableDays = payableDays;
    if (regularHours !== undefined) record.regularHours = regularHours;
    if (overtimeHours !== undefined) record.overtimeHours = overtimeHours;
    if (unpaidLeaveDays !== undefined) record.unpaidLeaveDays = unpaidLeaveDays;
    if (baseSalary !== undefined) record.baseSalary = baseSalary;
    if (shiftAllowance !== undefined) record.shiftAllowance = shiftAllowance;
    if (deductions !== undefined) record.deductions = deductions;

    // Recalculate net salary based on fields (or just use adjustments)
    const dailyRate = record.baseSalary / 30;
    const overtimePay = record.overtimeHours * (dailyRate / 8) * 1.5;
    let netSalary = record.baseSalary + record.shiftAllowance + overtimePay - record.deductions;

    // Legacy adjustment append
    if (type && amount) {
      record.adjustments.push({ type, amount, reason });
      if (type === 'addition') {
        netSalary += amount;
      } else {
        netSalary -= amount;
        record.deductions += amount;
      }
    }
    
    record.netSalary = netSalary;
    record.status = 'Adjusted';
    await record.save();

    res.status(200).json({ message: 'Payroll adjusted successfully', record });
  } catch (error) {
    console.error('Adjust Payroll Error:', error);
    res.status(500).json({ error: 'Failed to adjust payroll' });
  }
};

// Lock Payroll Period
export const lockPayrollPeriod = async (req: Request, res: Response): Promise<void> => {
  try {
    const { periodId } = req.params;
    const { userId } = req.body; // In real app, from auth token

    const period = await PayrollPeriod.findById(periodId);
    if (!period) {
      res.status(404).json({ error: 'Payroll period not found' });
      return;
    }

    if (period.status === 'Locked') {
      res.status(400).json({ error: 'Payroll period is already locked.' });
      return;
    }

    period.status = 'Locked';
    period.lockedAt = new Date();
    period.lockedBy = userId;
    await period.save();

    await PayrollRecord.updateMany({ periodId: period._id }, { status: 'Approved' });

    res.status(200).json({ message: 'Payroll period locked successfully', period });
  } catch (error) {
    console.error('Lock Payroll Error:', error);
    res.status(500).json({ error: 'Failed to lock payroll period' });
  }
};

export const unlockPayrollPeriod = async (req: Request, res: Response): Promise<void> => {
  try {
    const period = await PayrollPeriod.findById(req.params.periodId);
    if (!period) {
      res.status(404).json({ error: 'Payroll period not found' });
      return;
    }
    
    period.status = 'Draft';
    await period.save();

    await PayrollRecord.updateMany(
      { periodId: period._id },
      { $set: { status: 'Draft' } }
    );

    res.status(200).json({ message: 'Payroll period unlocked successfully', period });
  } catch (error) {
    console.error('Unlock Payroll Error:', error);
    res.status(500).json({ error: 'Failed to unlock payroll period' });
  }
};

// Export Payroll
export const exportPayroll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { periodId } = req.params;
    const { format, scope } = req.query; // 'csv' or 'json'
    const user = (req as any).user;
    const employee = (req as any).employee;

    const query: any = { periodId };
    
    // Scoping for employee exports
    if (scope === 'me' || (user && user.role === 'Employee')) {
      query.employeeId = employee?._id || user?.id;
    }

    const records = await PayrollRecord.find(query)
      .populate('employeeId', 'employeeId firstName lastName email designation')
      .lean();

    if (!records.length) {
      res.status(404).json({ error: 'No records found for this period' });
      return;
    }

    const exportData = records.map(r => {
      const emp = r.employeeId as any;
      const dailyRate = r.baseSalary / 30;
      const overtimePay = r.overtimeHours * (dailyRate / 8) * 1.5;
      
      return {
        EmployeeID: emp.employeeId,
        Name: `${emp.firstName} ${emp.lastName}`,
        Designation: emp.designation,
        BaseSalary: r.baseSalary.toFixed(2),
        PayableDays: r.payableDays,
        RegularHours: r.regularHours.toFixed(2),
        OvertimeHours: r.overtimeHours.toFixed(2),
        OvertimePay: overtimePay.toFixed(2),
        ShiftAllowance: r.shiftAllowance.toFixed(2),
        Deductions: r.deductions.toFixed(2),
        NetSalary: r.netSalary.toFixed(2),
        Status: r.status
      };
    });

    if (format === 'csv') {
      const csv = Papa.unparse(exportData);
      res.header('Content-Type', 'text/csv');
      res.attachment('payroll_export.csv');
      res.send(csv);
    } else {
      res.status(200).json(exportData);
    }
  } catch (error) {
    console.error('Export Payroll Error:', error);
    res.status(500).json({ error: 'Failed to export payroll' });
  }
};

export const getMyPay = async (req: Request, res: Response): Promise<void> => {
  try {
    const employeeId = (req as any).employee?._id || req.query.employeeId;
    if (!employeeId) {
      res.status(400).json({ error: "Employee ID is required" });
      return;
    }
    const records = await PayrollRecord.find({ employeeId }).populate("periodId").sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pay records" });
  }
};

export const getPayrollPeriods = async (req: Request, res: Response): Promise<void> => {
  try {
    const periods = await PayrollPeriod.find({ companyId: (req as any).companyId }).sort({ startDate: -1 });
    const totalRecords = await PayrollRecord.countDocuments();
    console.log(`[getPayrollPeriods] Found ${periods.length} periods. TOTAL PayrollRecords in DB: ${totalRecords}`);
    res.status(200).json(periods);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payroll periods' });
  }
};

// Get records for a specific period
export const getPayrollRecordsForPeriod = async (req: Request, res: Response): Promise<void> => {
  try {
    const periodId = req.params.periodId;
    console.log(`[getPayrollRecordsForPeriod] Fetching records for periodId: ${periodId}`);
    const records = await PayrollRecord.find({ periodId }).populate("employeeId", "firstName lastName employeeId designation");
    console.log(`[getPayrollRecordsForPeriod] Found ${records.length} records`);
    res.status(200).json(records);
  } catch (err) {
    console.error(`[getPayrollRecordsForPeriod] Error:`, err);
    res.status(500).json({ error: "Failed to fetch payroll records" });
  }
};
