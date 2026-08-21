import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { execSync } from 'child_process';

let mongoServer: MongoMemoryReplSet | null = null;

const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      const conn = await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      console.log('MongoDB Connected successfully.');
      return conn;
    }
    throw new Error('No MONGODB_URI provided');
  } catch (error) {
    console.warn(`Real MongoDB connection failed (${error.message}).`);
    
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      console.warn('USE_IN_MEMORY_DB is true. Falling back to In-Memory DB...');
      mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
      const uri = mongoServer.getUri();
      
      const conn = await mongoose.connect(uri);
      // Remove console.log of host to prevent leaking connection details
      console.log('In-Memory MongoDB Connected');
      
      // Seed the database if we're falling back to memory, but ONLY if we aren't already running the seed script
      if (!process.argv[1]?.includes('seed.ts') && !process.argv[1]?.includes('seedRoles.ts')) {
        console.log('Running automatic seed for In-Memory DB...');
        // Run asynchronously without blocking
        import('../seed/seed.js').then(({ runSeed }) => {
           // We trick it into connecting but since mongoose is already connected, it's a no-op
           process.env.MONGODB_URI = uri; 
           runSeed(false).catch(err => console.error('Seed error:', err));
        }).catch(err => {
           console.error('Failed to load seed script:', err);
        });
      }
      
      return conn;
    } else {
      console.error('In-Memory DB fallback is disabled. Set USE_IN_MEMORY_DB=true to enable it.');
      throw error;
    }
  }
};

const READY_STATES: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

export const getDBHealth = () => {
  const readyState: number = mongoose.connection.readyState;
  return {
    status: readyState === 1 ? "healthy" : "unhealthy",
    state: READY_STATES[readyState] ?? "unknown",
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    inMemory: mongoServer !== null,
  };
};

export const closeDB = async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
};

export default connectDB;
