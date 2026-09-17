import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import connectDB, { closeDB } from '../../server/config/db.js';
import { RetentionService } from '../../server/services/retentionService.js';
import { redactSensitiveData } from '../../server/utils/redact.js';
import AuditLog from '../../server/models/AuditLog.js';
import Company from '../../server/models/Company.js';

describe('Data Retention, Privacy & Redaction Suite (Task 16)', () => {
  let testCompany: any;
  let companyId: any;

  beforeAll(async () => {
    await connectDB();
    testCompany = await Company.create({ name: 'Retention Co', code: 'RET_' + Date.now() });
    companyId = testCompany._id;
  }, 30000);

  afterAll(async () => {
    await AuditLog.deleteMany({ companyId });
    if (testCompany?._id) await Company.findByIdAndDelete(testCompany._id);
    await closeDB();
  });

  it('redacts sensitive credentials, tokens, and PII recursively', () => {
    const sensitivePayload = {
      user: 'admin',
      password: 'SuperSecretPassword123!',
      nested: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy',
        secret: 'my-ultra-secret',
        creditCard: '4111-2222-3333-4444',
      },
      publicInfo: 'visible-data',
    };

    const sanitized = redactSensitiveData(sensitivePayload);

    expect(sanitized.user).toBe('admin');
    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.nested.token).toBe('[REDACTED]');
    expect(sanitized.nested.secret).toBe('[REDACTED]');
    expect(sanitized.nested.creditCard).toBe('[REDACTED]');
    expect(sanitized.publicInfo).toBe('visible-data');
  });

  it('performs data retention analysis in dry-run mode without modifying records', async () => {
    // Create an old audit log (120 days ago)
    const oldDate = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000);
    await AuditLog.create({
      companyId,
      performedBy: 'retention-test@example.com',
      userRole: 'Admin',
      action: 'RETENTION_TEST',
      details: 'Old audit event',
      timestamp: oldDate,
    });

    const dryRunResult = await RetentionService.runRetentionCleanup(
      { auditLogDays: 90, notificationDays: 30, tokenDays: 7 },
      true
    );

    expect(dryRunResult.dryRun).toBe(true);
    expect(dryRunResult.auditLogsEligible).toBeGreaterThanOrEqual(1);
    expect(dryRunResult.auditLogsPurged).toBe(0);

    // Assert record is still present
    const record = await AuditLog.findOne({ action: 'RETENTION_TEST', companyId });
    expect(record).toBeDefined();

    // Actual purge
    const actualResult = await RetentionService.runRetentionCleanup(
      { auditLogDays: 90, notificationDays: 30, tokenDays: 7 },
      false
    );

    expect(actualResult.dryRun).toBe(false);
    expect(actualResult.auditLogsPurged).toBeGreaterThanOrEqual(1);

    // Assert record is now deleted
    const purgedRecord = await AuditLog.findOne({ action: 'RETENTION_TEST', companyId });
    expect(purgedRecord).toBeNull();
  });
});
