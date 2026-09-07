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
import { requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Calculate payroll for a period (Admin / HR only)
router.post('/calculate', requireRole(['Admin', 'HR']), calculatePayroll);

// Adjust a specific payroll record (Admin / HR only)
router.post('/record/:recordId/adjust', requireRole(['Admin', 'HR']), adjustPayrollRecord);

// Lock a payroll period (Admin / HR only)
router.post('/period/:periodId/lock', requireRole(['Admin', 'HR']), lockPayrollPeriod);

// Unlock a payroll period (Admin / HR only)
router.post('/period/:periodId/unlock', requireRole(['Admin', 'HR']), unlockPayrollPeriod);

// Export payroll data
router.get('/period/:periodId/export', exportPayroll);

// Get my pay (Employee view / personal view)
router.get('/my-pay', getMyPay);

// Get all payroll periods (HR/Admin view)
router.get('/periods', requireRole(['Admin', 'HR']), getPayrollPeriods);

// Get records for a specific period (HR/Admin view)
router.get('/period/:periodId/records', requireRole(['Admin', 'HR']), getPayrollRecordsForPeriod);

export default router;

