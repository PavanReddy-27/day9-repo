import crypto from 'crypto';
import AuditLog from '../models/AuditLog.js';
import { redactSensitiveData } from '../utils/redact.js';
import { writeAuditLog } from '../utils/audit.js';

export interface ExportOptions {
  format: 'json' | 'csv';
  startDate?: string;
  endDate?: string;
  actionFilter?: string;
  limit?: number;
}

export interface ExportResult {
  filename: string;
  contentType: string;
  data: string;
  sha256Checksum: string;
  recordCount: number;
  exportedAt: string;
}

export class ExportService {
  /**
   * Generates a secure, sanitized export of system audit logs with SHA-256 integrity verification
   */
  public static async exportAuditLogs(
    options: ExportOptions,
    actor: { id: string; role: string; email: string; companyId: string; ip: string }
  ): Promise<ExportResult> {
    const limit = Math.min(options.limit || 500, 2000);
    const filter: Record<string, any> = {};

    if (actor.companyId) {
      filter.companyId = actor.companyId;
    }

    if (options.startDate || options.endDate) {
      filter.timestamp = {};
      if (options.startDate) filter.timestamp.$gte = new Date(options.startDate);
      if (options.endDate) filter.timestamp.$lte = new Date(options.endDate);
    }

    if (options.actionFilter) {
      filter.action = options.actionFilter;
    }

    const rawLogs = await (AuditLog as any).find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    const sanitizedLogs = rawLogs.map((log) => redactSensitiveData(log));

    let output: string;
    let contentType = 'application/json';
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
    let filename = `audit-export-${timestampStr}.json`;

    if (options.format === 'csv') {
      contentType = 'text/csv';
      filename = `audit-export-${timestampStr}.csv`;
      const headers = ['ID', 'Timestamp', 'Action', 'Category', 'UserEmail', 'Role', 'IP', 'Details'];
      const rows = sanitizedLogs.map((l: any) => [
        `"${l._id}"`,
        `"${new Date(l.timestamp).toISOString()}"`,
        `"${l.action || ''}"`,
        `"${l.category || ''}"`,
        `"${l.userEmail || ''}"`,
        `"${l.role || ''}"`,
        `"${l.ip || ''}"`,
        `"${(l.details || '').replace(/"/g, '""')}"`,
      ]);
      output = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else {
      output = JSON.stringify(sanitizedLogs, null, 2);
    }

    const sha256Checksum = crypto.createHash('sha256').update(output).digest('hex');

    void writeAuditLog(
      {
        companyId: actor.companyId,
        role: actor.role,
        userEmail: actor.email,
        ip: actor.ip,
        headers: {},
      },
      'SECURE_DATA_EXPORT',
      `Exported ${sanitizedLogs.length} audit logs in ${options.format.toUpperCase()} format. Checksum: ${sha256Checksum}`,
      'Security',
      actor.id
    );

    return {
      filename,
      contentType,
      data: output,
      sha256Checksum,
      recordCount: sanitizedLogs.length,
      exportedAt: new Date().toISOString(),
    };
  }
}

export default ExportService;
