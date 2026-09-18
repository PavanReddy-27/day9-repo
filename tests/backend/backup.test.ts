import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { BackupService } from '../../server/services/backupService';

let mongoServer: MongoMemoryServer;

describe('Backup and Restoration Service', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('exports collection snapshot and restores data accurately', async () => {
    const db = mongoose.connection.db;
    if (!db) throw new Error('DB not available');

    // Populate test collection
    const testColl = db.collection('test_backup');
    await testColl.insertMany([
      { _id: '1' as any, name: 'Backup Test Item 1' },
      { _id: '2' as any, name: 'Backup Test Item 2' },
    ]);

    const backupService = new BackupService();
    const snapshot = await backupService.exportBackup(['test_backup']);

    expect(snapshot.collections).toHaveProperty('test_backup');
    expect(snapshot.collections['test_backup']).toHaveLength(2);

    // Modify collection
    await testColl.deleteMany({});
    const emptyDocs = await testColl.find({}).toArray();
    expect(emptyDocs).toHaveLength(0);

    // Restore from snapshot
    const restoreResult = await backupService.restoreBackup(snapshot);
    expect(restoreResult.restoredCollections).toContain('test_backup');
    expect(restoreResult.totalDocs).toBe(2);

    const restoredDocs = await testColl.find({}).toArray();
    expect(restoredDocs).toHaveLength(2);
    expect(restoredDocs[0].name).toBe('Backup Test Item 1');
  });
});
