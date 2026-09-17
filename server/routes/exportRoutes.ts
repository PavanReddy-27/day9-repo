import express from 'express';
import { exportAuditLogs, exportEmployees } from '../controllers/exportController.js';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateJWT);

router.get('/audit-logs', requireRole(['Admin', 'HR']), exportAuditLogs);
router.get('/employees', requireRole(['Admin', 'HR']), exportEmployees);

export default router;
