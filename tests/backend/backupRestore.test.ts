import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import connectDB, { closeDB } from '../../server/config/db.js';
import { runBackup } from '../../server/scripts/backup.js';
import { runRestore } from '../../server/scripts/restore.js';
import Company from '../../server/models/Company.js';

describe('Disaster Recovery & Database Backup/Restore Suite (Task 16)', () => {
  let createdBackupId = '';

  beforeAll(async () => {
    await connectDB();
    // Ensure at least one test record exists
    await Company.updateOne(
      { code: 'TEST_DR_CO' },
      { $set: { code: 'TEST_DR_CO', name: 'Test Disaster Recovery Co' } },
      { upsert: true }
    );
  }, 30000);

  afterAll(async () => {
    await Company.deleteOne({ code: 'TEST_DR_CO' });
    // Clean up created test backup directory if exists
    if (createdBackupId) {
      const dir = path.resolve(process.cwd(), 'backups', createdBackupId);
      if (fs.existsSync(dir)) {
        try {
          fs.rmSync(dir, { recursive: true, force: true });
        } catch {
          // Ignore
        }
      }
    }
    await closeDB();
  });

  it('generates a verified database snapshot with SHA-256 manifest', async () => {
    const manifest = await runBackup(false, ['companies']);
    expect(manifest).toBeDefined();
    expect(manifest.backupId).toMatch(/^backup-/);
    expect(manifest.totalCollections).toBe(1);
    expect(manifest.totalDocuments).toBeGreaterThanOrEqual(1);

    createdBackupId = manifest.backupId;

    const manifestFilePath = path.resolve(process.cwd(), 'backups', manifest.backupId, 'manifest.json');
    expect(fs.existsSync(manifestFilePath)).toBe(true);

    const savedManifest = JSON.parse(fs.readFileSync(manifestFilePath, 'utf8'));
    expect(savedManifest.backupId).toBe(manifest.backupId);
    expect(savedManifest.collections.length).toBe(manifest.collections.length);
  }, 30000);

  it('restores collections from backup snapshot with 100% data fidelity', async () => {
    expect(createdBackupId).toBeTruthy();

    const restoreResult = await runRestore(createdBackupId, false, ['companies']);
    expect(restoreResult.verified).toBe(true);
    expect(restoreResult.backupId).toBe(createdBackupId);
    expect(restoreResult.restoredCollections).toBe(1);
    expect(restoreResult.restoredDocuments).toBeGreaterThanOrEqual(1);

    // Verify company record exists
    const co = await Company.findOne({ code: 'TEST_DR_CO' });
    expect(co).toBeDefined();
    expect(co?.name).toBe('Test Disaster Recovery Co');
  }, 30000);
});
