import mongoose from 'mongoose';

export interface BackupSnapshot {
  timestamp: string;
  collections: Record<string, any[]>;
}

export class BackupService {
  /**
   * Export all documents from specified collections into a JSON backup snapshot.
   */
  async exportBackup(collectionNames?: string[]): Promise<BackupSnapshot> {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection is not open');
    }

    const allCollections = await db.listCollections().toArray();
    const targetNames = collectionNames || allCollections.map((c) => c.name);

    const snapshot: BackupSnapshot = {
      timestamp: new Date().toISOString(),
      collections: {},
    };

    for (const name of targetNames) {
      const docs = await db.collection(name).find({}).toArray();
      snapshot.collections[name] = docs;
    }

    return snapshot;
  }

  /**
   * Restore collections from a backup snapshot.
   */
  async restoreBackup(snapshot: BackupSnapshot): Promise<{ restoredCollections: string[]; totalDocs: number }> {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection is not open');
    }

    let totalDocs = 0;
    const restoredCollections: string[] = [];

    for (const [collName, docs] of Object.entries(snapshot.collections)) {
      const collection = db.collection(collName);
      await collection.deleteMany({});
      if (docs.length > 0) {
        await collection.insertMany(docs);
        totalDocs += docs.length;
      }
      restoredCollections.push(collName);
    }

    return { restoredCollections, totalDocs };
  }
}

export const backupService = new BackupService();
export default backupService;
