/**
 * MongoDB Automated Backup Script (Task 16 - Sridhika)
 * Creates consistent, verified snapshots of all database collections with
 * SHA-256 checksums and a structured manifest.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import connectDB, { closeDB } from '../config/db.js';
import { logger } from '../utils/logger.js';

export interface BackupCollectionSummary {
  name: string;
  count: number;
  sizeBytes: number;
  sha256: string;
}

export interface BackupManifest {
  backupId: string;
  createdAt: string;
  database: string;
  host: string;
  totalCollections: number;
  totalDocuments: number;
  totalSizeBytes: number;
  collections: BackupCollectionSummary[];
}

export async function runBackup(shouldClose = true, collectionsFilter?: string[]): Promise<BackupManifest> {
  console.log('====================================================');
  console.log('[Disaster Recovery] Initiating MongoDB Backup...');
  console.log('====================================================');

  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection is not ready');
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupId = `backup-${timestamp}`;
  const backupsDir = path.resolve(process.cwd(), 'backups');
  const targetDir = path.join(backupsDir, backupId);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const collections = await db.listCollections().toArray();
  const collectionSummaries: BackupCollectionSummary[] = [];

  let totalDocs = 0;
  let totalBytes = 0;

  for (const collInfo of collections) {
    const collName = collInfo.name;
    // Skip system/internal collections
    if (collName.startsWith('system.')) continue;
    if (collectionsFilter && collectionsFilter.length > 0 && !collectionsFilter.includes(collName)) continue;

    const coll = db.collection(collName);
    const docs = await coll.find({}).toArray();

    const serialized = JSON.stringify(docs, null, 2);
    const filePath = path.join(targetDir, `${collName}.json`);
    fs.writeFileSync(filePath, serialized, 'utf8');

    const fileBuffer = Buffer.from(serialized, 'utf8');
    const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const sizeBytes = fileBuffer.length;

    totalDocs += docs.length;
    totalBytes += sizeBytes;

    collectionSummaries.push({
      name: collName,
      count: docs.length,
      sizeBytes,
      sha256,
    });

    console.log(`✓ Backed up collection: ${collName.padEnd(25)} (${docs.length} docs, ${Math.round(sizeBytes / 1024)} KB)`);
  }

  const manifest: BackupManifest = {
    backupId,
    createdAt: new Date().toISOString(),
    database: mongoose.connection.name || 'workforce_analytics',
    host: mongoose.connection.host || 'localhost',
    totalCollections: collectionSummaries.length,
    totalDocuments: totalDocs,
    totalSizeBytes: totalBytes,
    collections: collectionSummaries,
  };

  const manifestPath = path.join(targetDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log('====================================================');
  console.log(`[Disaster Recovery] Backup ${backupId} completed!`);
  console.log(`Total Collections: ${manifest.totalCollections} | Total Documents: ${manifest.totalDocuments} | Size: ${Math.round(totalBytes / 1024)} KB`);
  console.log(`Manifest Path: ${manifestPath}`);
  console.log('====================================================');

  logger.info(`Database backup created: ${backupId}`, { manifest });

  if (shouldClose) {
    await closeDB();
  }

  return manifest;
}

if (process.argv[1]?.includes('backup.ts')) {
  runBackup(true).catch(console.error);
}

export default runBackup;
