import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import os from 'os';
import { getDBHealth } from '../config/db.js';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware.js';
import { requestMetrics } from '../utils/logger.js';
import { RetentionService } from '../services/retentionService.js';
import { ExportService } from '../services/exportService.js';
import fs from 'fs';
import path from 'path';
import { getConnectedClientsCount, getConnectedSSECount, broadcastSSE } from '../utils/sse.js';
import RefreshToken from '../models/RefreshToken.js';
import { User } from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import DeadLetterJob from '../models/DeadLetterJob.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import Employee from '../models/Employee.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import LeaveRequest from '../models/LeaveRequest.js';
import { JobQueueService } from '../services/jobQueueService.js';

const router = express.Router();

const startTime = Date.now();

// 1. Liveness Probe
export const healthHandler = (_req: Request, res: Response): void => {
  const mem = process.memoryUsage();
  res.status(200).json({
    status: 'healthy',
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    memory: {
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
      rssMB: Math.round(mem.rss / 1024 / 1024),
    },
  });
};

// 2. Readiness Probe (Deep DB & Service Verification)
export const readyHandler = async (_req: Request, res: Response): Promise<void> => {
  const isDbReady = mongoose.connection.readyState === 1;
  let dbPingMs = -1;

  if (isDbReady && mongoose.connection.db) {
    try {
      const pingStart = Date.now();
      await Promise.race([
        mongoose.connection.db.admin().ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('MongoDB ping timeout')), 2000)),
      ]);
      dbPingMs = Date.now() - pingStart;
    } catch {
      dbPingMs = -1;
    }
  }

  const isReady = isDbReady && dbPingMs >= 0;
  const statusCode = isReady ? 200 : 503;

  res.status(statusCode).json({
    status: isReady ? 'ready' : 'not_ready',
    database: {
      connected: isReady,
      status: isReady ? 'Online' : 'Offline',
      state: isReady ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState,
      pingMs: Math.max(0, dbPingMs),
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'workforce',
    },
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
  });
};

// 3. Version & Build Information
export const versionHandler = (_req: Request, res: Response): void => {
  res.status(200).json({
    name: 'workforce-analytics',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    commit: process.env.GIT_COMMIT_SHA || 'dev-local',
    buildDate: process.env.BUILD_DATE || new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
  });
};

// Public Probe Endpoints
router.get('/health', healthHandler);
router.get('/ready', readyHandler);
router.get('/version', versionHandler);

// 4. Detailed Telemetry Metrics (Admin Only)
router.get('/system/metrics', authenticateJWT, requireRole(['Admin']), async (_req: Request, res: Response) => {
  try {
    const mem = process.memoryUsage();
    let dbPingMs = 0;
    let collectionsCount = 0;
    const documentCounts: Record<string, number> = {};
    let activeSessions = 0;
    let failedLogins = 0;
    let lockedAccounts = 0;
    let offlineSyncFailures = 0;
    let notificationFailures = 0;
    let isDbOnline = false;
    let recentFailedLogins: any[] = [];
    let recentLockedAccounts: any[] = [];

    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.connection.db) {
      try {
        const pingStart = Date.now();
        await Promise.race([
          mongoose.connection.db.admin().ping(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('MongoDB ping timeout')), 2000)),
        ]);
        dbPingMs = Date.now() - pingStart;
        isDbOnline = true;

        const colls = await mongoose.connection.db.listCollections().toArray();
        collectionsCount = colls.length;

        // Query real live document counts across primary models
        const [
          userCount,
          empCount,
          attCount,
          auditCount,
          leaveCount,
          jobCount,
          dlqCount,
          tokenCount,
          notifCount,
        ] = await Promise.all([
          User.countDocuments().catch(() => 0),
          Employee.countDocuments().catch(() => 0),
          AttendanceRecord.countDocuments().catch(() => 0),
          AuditLog.countDocuments().catch(() => 0),
          LeaveRequest.countDocuments().catch(() => 0),
          Job.countDocuments().catch(() => 0),
          DeadLetterJob.countDocuments().catch(() => 0),
          RefreshToken.countDocuments().catch(() => 0),
          Notification.countDocuments().catch(() => 0),
        ]);

        documentCounts['users'] = userCount;
        documentCounts['employees'] = empCount;
        documentCounts['attendancerecords'] = attCount;
        documentCounts['auditlogs'] = auditCount;
        documentCounts['leaverequests'] = leaveCount;
        documentCounts['jobs'] = jobCount;
        documentCounts['deadletterjobs'] = dlqCount;
        documentCounts['refreshtokens'] = tokenCount;
        documentCounts['notifications'] = notifCount;

        // Real active sessions: active refresh tokens + connected SSE clients
        const validTokens = await RefreshToken.countDocuments({
          expiresAt: { $gt: new Date() },
          revoked: { $ne: true },
        }).catch(() => 0);
        const sseCount = getConnectedSSECount();
        activeSessions = Math.max(validTokens, sseCount, 1);

        // Real failed logins from AuditLog
        failedLogins = await AuditLog.countDocuments({ action: 'LOGIN_FAILED' }).catch(() => 0);

        // Real locked accounts currently locked
        lockedAccounts = await User.countDocuments({ lockUntil: { $gt: new Date() } }).catch(() => 0);

        // Offline attendance sync failures from Dead-Letter Queue
        offlineSyncFailures = await DeadLetterJob.countDocuments({
          type: { $in: ['ATTENDANCE_SYNC', 'OFFLINE_ATTENDANCE'] },
          resolution: 'unresolved',
        }).catch(() => 0);

        // Notification delivery failures from DLQ and AuditLog
        const [dlqNotifs, auditNotifs] = await Promise.all([
          DeadLetterJob.countDocuments({
            type: 'NOTIFICATION_DELIVERY',
            resolution: 'unresolved',
          }).catch(() => 0),
          AuditLog.countDocuments({
            action: 'NOTIFICATION_DELIVERY_FAILED',
          }).catch(() => 0),
        ]);
        notificationFailures = dlqNotifs + auditNotifs;

        // Recent failed logins and locked accounts for inspection
        recentFailedLogins = await AuditLog.find({ action: 'LOGIN_FAILED' })
          .sort({ timestamp: -1 })
          .limit(10)
          .lean()
          .catch(() => []);

        recentLockedAccounts = await User.find({ lockUntil: { $gt: new Date() } })
          .select('email role failedLoginAttempts lockUntil updatedAt')
          .lean()
          .catch(() => []);
      } catch {
        isDbOnline = false;
        dbPingMs = 0;
      }
    }

    const jobStats = await JobQueueService.getStats().catch(() => null);

    res.status(200).json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        server: {
          uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
          nodeVersion: process.version,
          platform: `${os.type()} ${os.release()} (${os.arch()})`,
          cpuCount: os.cpus().length,
          loadAverage: os.loadavg(),
          freeMemoryMB: Math.round(os.freemem() / 1024 / 1024),
          totalMemoryMB: Math.round(os.totalmem() / 1024 / 1024),
        },
        memory: {
          heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
          heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
          rssMB: Math.round(mem.rss / 1024 / 1024),
          externalMB: Math.round(mem.external / 1024 / 1024),
        },
        database: {
          status: isDbOnline ? 'connected' : 'disconnected',
          state: isDbOnline ? 'Online' : 'Offline',
          connected: isDbOnline,
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host || 'unknown',
          name: mongoose.connection.name || 'workforce',
          pingMs: dbPingMs,
          collectionsCount,
          documentCounts,
        },
        traffic: {
          totalRequests: requestMetrics.totalRequests,
          status2xx: requestMetrics.status2xx,
          status4xx: requestMetrics.status4xx,
          status5xx: requestMetrics.status5xx,
          p95LatencyMs: requestMetrics.p95Latency,
          avgLatencyMs: requestMetrics.avgLatency,
          availabilityPct: requestMetrics.availabilityPct,
        },
        monitoring: {
          activeSessions,
          connectedClients: getConnectedClientsCount(),
          failedLogins,
          lockedAccounts,
          offlineSyncFailures,
          notificationFailures,
          recentFailedLogins,
          recentLockedAccounts,
        },
        backgroundJobs: {
          status: isDbOnline ? 'active' : 'idle',
          stats: jobStats,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Data Retention Cleanup Action (Admin Only)
router.post('/system/retention', authenticateJWT, requireRole(['Admin']), async (req: any, res: Response) => {
  try {
    const { dryRun, auditLogDays, notificationDays, tokenDays } = req.body;
    const policy = {
      auditLogDays: Number(auditLogDays) || 90,
      notificationDays: Number(notificationDays) || 30,
      tokenDays: Number(tokenDays) || 7,
    };

    const actor = {
      role: req.user.role,
      email: req.user.email,
      companyId: req.user.companyId,
      ip: req.ip,
    };

    const result = await RetentionService.runRetentionCleanup(policy, Boolean(dryRun), actor);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Secure Data Export (Admin Only)
router.post('/system/export', authenticateJWT, requireRole(['Admin']), async (req: any, res: Response) => {
  try {
    const { format = 'json', startDate, endDate, actionFilter, limit } = req.body;
    const actor = {
      id: req.user.id,
      role: req.user.role,
      email: req.user.email,
      companyId: req.user.companyId,
      ip: req.ip,
    };

    const result = await ExportService.exportAuditLogs(
      { format, startDate, endDate, actionFilter, limit },
      actor
    );

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('X-Checksum-SHA256', result.sha256Checksum);
    res.status(200).send(result.data);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. Backup & Disaster Recovery Endpoints (Admin Only)
router.get('/system/backups', authenticateJWT, requireRole(['Admin']), async (_req: Request, res: Response) => {
  try {
    const backupsDir = path.resolve(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      return res.status(200).json({ success: true, data: [] });
    }

    const entries = fs.readdirSync(backupsDir, { withFileTypes: true });
    const manifests = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const manifestPath = path.join(backupsDir, entry.name, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          try {
            const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            manifests.push({ id: entry.name, ...raw });
          } catch {
            // Ignore malformed manifest
          }
        }
      }
    }

    manifests.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    res.status(200).json({ success: true, data: manifests });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/system/backup', authenticateJWT, requireRole(['Admin']), async (req: any, res: Response) => {
  try {
    const { runBackup } = await import('../scripts/backup.js');
    const result = await runBackup(false);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. Test API Ping (records instant telemetry and returns latency)
router.post('/system/test-ping', authenticateJWT, requireRole(['Admin']), async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API Ping successful. Latency recorded in live telemetry.',
    timestamp: new Date().toISOString(),
    metrics: {
      totalRequests: requestMetrics.totalRequests,
      avgLatencyMs: requestMetrics.avgLatency,
      availabilityPct: requestMetrics.availabilityPct,
    },
  });
});

// 9. Test SSE Broadcast Ping (broadcasts live event to connected SSE clients)
router.post('/system/test-sse-ping', authenticateJWT, requireRole(['Admin']), async (req: any, res: Response) => {
  const clientCount = getConnectedSSECount();
  broadcastSSE('SYSTEM_PING', {
    message: 'Live test ping from Admin System Health',
    timestamp: new Date().toISOString(),
    initiatedBy: req.user?.email || 'admin',
  });
  res.status(200).json({
    success: true,
    message: `Broadcasted SYSTEM_PING to ${clientCount} active SSE client(s)`,
    connectedClients: clientCount,
  });
});

// 10. Send Test Notification (creates real notification & dispatches via SSE)
router.post('/system/test-notification', authenticateJWT, requireRole(['Admin']), async (req: any, res: Response) => {
  try {
    const { NotificationService } = await import('../services/notificationService.js');
    const { title = 'System Health Test Alert', message = 'Real-time test notification verification', type = 'INFO' } = req.body || {};
    const companyId = req.companyId || req.user?.companyId;
    const userId = req.user?.id || req.employee?._id;
    const notification = await NotificationService.sendNotification(
      userId,
      companyId,
      title,
      message,
      type,
      '/admin/system-health'
    );
    res.status(200).json({
      success: true,
      message: 'Test notification created and dispatched via SSE stream',
      data: notification,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
