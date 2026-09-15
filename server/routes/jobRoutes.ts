import express, { Request, Response } from 'express';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware.js';
import { JobQueueService } from '../services/jobQueueService.js';
import DeadLetterJob from '../models/DeadLetterJob.js';
import Job from '../models/Job.js';
import { writeAuditLog } from '../utils/audit.js';

const router = express.Router();

// Require Admin authorization for all background job operations
router.use(authenticateJWT, requireRole(['Admin']));

// 1. Get Job Queue Statistics
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await JobQueueService.getStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Get Dead-Letter Queue Jobs
router.get('/dead-letter', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      DeadLetterJob.find({ resolution: 'unresolved' })
        .sort({ failedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DeadLetterJob.countDocuments({ resolution: 'unresolved' }),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Retry / Re-drive a Dead-Letter Job
router.post('/dead-letter/:id/retry', async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const actorEmail = req.user?.email || 'admin@thestackly.com';
    const reDrivenJob = await JobQueueService.redriveDeadLetter(id, actorEmail);

    // Record every manual retry in the audit log (Task 16 requirement)
    await writeAuditLog(
      {
        companyId: req.user?.companyId || req.companyId,
        role: req.user?.role || 'Admin',
        userEmail: actorEmail,
        ip: req.ip,
        headers: req.headers,
      },
      'JOB_MANUAL_RETRY',
      `Manual re-drive of dead-letter job [${id}] of type ${reDrivenJob.type}`,
      'JobQueue',
      String(reDrivenJob._id)
    );

    res.status(200).json({
      success: true,
      message: 'Job re-driven back to active queue successfully',
      data: reDrivenJob,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 4. Discard / Purge a Dead-Letter Job
router.delete('/dead-letter/:id', async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const dlq = await DeadLetterJob.findById(id);
    if (!dlq) {
      return res.status(404).json({ success: false, message: 'Dead-letter job not found' });
    }

    dlq.resolution = 'discarded';
    dlq.resolvedAt = new Date();
    dlq.resolvedBy = req.user?.email || 'admin';
    await dlq.save();

    await writeAuditLog(
      {
        companyId: req.user?.companyId || req.companyId,
        role: req.user?.role || 'Admin',
        userEmail: req.user?.email || 'admin',
        ip: req.ip,
        headers: req.headers,
      },
      'JOB_DISCARDED',
      `Discarded dead-letter job [${id}] of type ${dlq.type}`,
      'JobQueue',
      String(dlq._id)
    );

    res.status(200).json({ success: true, message: 'Dead-letter job marked as discarded' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Trigger a Background Job On-Demand
router.post('/trigger', async (req: Request, res: Response) => {
  try {
    const { type, payload = {} } = req.body;
    if (!type) {
      return res.status(400).json({ success: false, message: 'Job type is required' });
    }

    const job = await JobQueueService.enqueue(type, payload, { priority: 2 });
    res.status(201).json({ success: true, message: `Job ${type} enqueued`, data: job });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Test Failure / Retry Demonstration Helper
router.post('/test-retry-demo', async (req: Request, res: Response) => {
  try {
    const { shouldFailAlways = true, maxRetries = 3 } = req.body;
    const job = await JobQueueService.enqueue(
      'TEST_RETRY_JOB',
      { shouldFailAlways, requestedAt: new Date().toISOString() },
      { maxRetries, priority: 5 }
    );

    res.status(201).json({
      success: true,
      message: 'Test failure/retry job enqueued for demonstration',
      data: job,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

