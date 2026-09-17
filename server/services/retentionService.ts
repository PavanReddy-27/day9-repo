import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import RefreshToken from '../models/RefreshToken.js';
import TokenBlacklist from '../models/TokenBlacklist.js';
import { logger } from '../utils/logger.js';
import { writeAuditLog } from '../utils/audit.js';

export interface RetentionPolicyConfig {
  auditLogDays: number;
  notificationDays: number;
  tokenDays: number;
}

export const DEFAULT_RETENTION_POLICY: RetentionPolicyConfig = {
  auditLogDays: 90,
  notificationDays: 30,
  tokenDays: 7,
};

export interface RetentionResult {
  dryRun: boolean;
  auditLogsEligible: number;
  auditLogsPurged: number;
  notificationsEligible: number;
  notificationsPurged: number;
  tokensEligible: number;
  tokensPurged: number;
  executedAt: string;
  durationMs: number;
}

export class RetentionService {
  /**
   * Runs retention cleanup based on the policy
   */
  public static async runRetentionCleanup(
    policy: RetentionPolicyConfig = DEFAULT_RETENTION_POLICY,
    dryRun = false,
    actor?: { role?: string; email?: string; companyId?: string; ip?: string }
  ): Promise<RetentionResult> {
    const start = Date.now();
    const now = new Date();

    const auditCutoff = new Date(now.getTime() - policy.auditLogDays * 24 * 60 * 60 * 1000);
    const notifCutoff = new Date(now.getTime() - policy.notificationDays * 24 * 60 * 60 * 1000);
    const tokenCutoff = new Date(now.getTime() - policy.tokenDays * 24 * 60 * 60 * 1000);

    const auditFilter = { timestamp: { $lt: auditCutoff } };
    const notifFilter = { createdAt: { $lt: notifCutoff }, isRead: true };
    const tokenFilter = { expiresAt: { $lt: tokenCutoff } };

    const auditEligible = await AuditLog.countDocuments(auditFilter);
    const notifEligible = await Notification.countDocuments(notifFilter);
    const tokenEligible = await RefreshToken.countDocuments(tokenFilter);

    let auditPurged = 0;
    let notifPurged = 0;
    let tokenPurged = 0;

    if (!dryRun) {
      const auditRes = await AuditLog.deleteMany(auditFilter);
      auditPurged = auditRes.deletedCount || 0;

      const notifRes = await Notification.deleteMany(notifFilter);
      notifPurged = notifRes.deletedCount || 0;

      const tokenRes = await RefreshToken.deleteMany(tokenFilter);
      tokenPurged = tokenRes.deletedCount || 0;

      try {
        await TokenBlacklist.deleteMany({ createdAt: { $lt: tokenCutoff } });
      } catch {
        // Optional legacy cleanup
      }

      logger.info('Data retention purge executed successfully', {
        policy,
        auditPurged,
        notifPurged,
        tokenPurged,
      });

      if (actor && actor.companyId) {
        void writeAuditLog(
          {
            companyId: actor.companyId,
            role: actor.role || 'Admin',
            userEmail: actor.email || 'system@workforce.internal',
            ip: actor.ip || '127.0.0.1',
            headers: {},
          },
          'DATA_RETENTION_PURGE',
          `Executed data retention purge: ${auditPurged} logs, ${notifPurged} notifications, ${tokenPurged} tokens removed.`,
          'System',
          'system'
        );
      }
    }

    const durationMs = Date.now() - start;

    return {
      dryRun,
      auditLogsEligible: auditEligible,
      auditLogsPurged: auditPurged,
      notificationsEligible: notifEligible,
      notificationsPurged: notifPurged,
      tokensEligible: tokenEligible,
      tokensPurged: tokenPurged,
      executedAt: new Date().toISOString(),
      durationMs,
    };
  }
}

export default RetentionService;

