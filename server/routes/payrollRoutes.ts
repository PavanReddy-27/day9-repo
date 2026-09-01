import { Router } from 'express';
import { 
  calculatePayroll, 
  adjustPayrollRecord, 
  lockPayrollPeriod, 
  unlockPayrollPeriod,
  exportPayroll,
  getMyPay,
  getPayrollPeriods,
  getPayrollRecordsForPeriod
} from '../controllers/payrollController.js';

const router = Router();

// Calculate payroll for a period
router.post('/calculate', calculatePayroll);

// Adjust a specific payroll record
router.post('/record/:recordId/adjust', adjustPayrollRecord);

// Lock a payroll period
router.post('/period/:periodId/lock', lockPayrollPeriod);

// Unlock a payroll period
router.post('/period/:periodId/unlock', unlockPayrollPeriod);

// Export payroll data
router.get('/period/:periodId/export', exportPayroll);

// Get my pay (Employee view)
router.get('/my-pay', getMyPay);

// Get all payroll periods (HR/Admin view)
router.get('/periods', getPayrollPeriods);

// Get records for a specific period
router.get('/period/:periodId/records', getPayrollRecordsForPeriod);

export default router;

