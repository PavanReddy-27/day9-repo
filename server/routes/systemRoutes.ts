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
import { getConnectedClientsCount } from '../utils/sse.js';

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
      await mongoose.connection.db.admin().ping();
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
      connected: isDbReady,
      pingMs: dbPingMs,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
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

    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const db = mongoose.connection.db;
      const pingStart = Date.now();
      await db.admin().ping();
      dbPingMs = Date.now() - pingStart;

      const colls = await db.listCollections().toArray();
      collectionsCount = colls.length;
      const collNames = colls.map((c) => c.name);

      // Sample counts of primary collections
      const tracked = ['users', 'employees', 'attendancerecords', 'auditlogs', 'leaverequests', 'jobs'];
      for (const name of tracked) {
        if (collNames.includes(name)) {
          documentCounts[name] = await db.collection(name).countDocuments();
        }
      }

      if (collNames.includes('sessions')) {
        activeSessions = await db.collection('sessions').countDocuments();
      } else if (collNames.includes('refreshtokens')) {
        activeSessions = await db.collection('refreshtokens').countDocuments({ expiresAt: { $gt: new Date() } });
      }

      if (collNames.includes('auditlogs')) {
        failedLogins = await db.collection('auditlogs').countDocuments({ action: 'LOGIN_FAILED' });
      }

      if (collNames.includes('users')) {
        lockedAccounts = await db.collection('users').countDocuments({ lockUntil: { $gt: new Date() } });
      }

      if (collNames.includes('deadletterjobs')) {
        offlineSyncFailures = await db.collection('deadletterjobs').countDocuments({
          type: { $in: ['ATTENDANCE_SYNC', 'OFFLINE_ATTENDANCE'] },
          resolution: 'unresolved',
        });
        notificationFailures = await db.collection('deadletterjobs').countDocuments({
          type: 'NOTIFICATION_DELIVERY',
          resolution: 'unresolved',
        });
      }
    }

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
          status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
          host: mongoose.connection.host,
          name: mongoose.connection.name,
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

export default router;
