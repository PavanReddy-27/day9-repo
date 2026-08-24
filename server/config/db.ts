import mongoose from 'mongoose';
import { MongoMemoryReplSet, MongoMemoryServer } from 'mongodb-memory-server';
import { execSync } from 'child_process';

let memoryServer: MongoMemoryReplSet | any = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  try {
    if (process.env.MONGODB_URI) {
      const conn = await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      console.log('MongoDB Connected successfully.');
      return conn;
    }
    throw new Error('No MONGODB_URI provided');
  } catch (error: any) {
    console.warn(`Real MongoDB connection failed (${error.message}).`);
    
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      console.warn('USE_IN_MEMORY_DB is true. Falling back to In-Memory DB...');
      memoryServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
      const uri = memoryServer.getUri();
      
      const conn = await mongoose.connect(uri);
      console.log('In-Memory MongoDB Connected');
      
      if (!process.argv[1]?.includes('seed.ts') && !process.argv[1]?.includes('seedRoles.ts')) {
        console.log('Running automatic seed for In-Memory DB...');
        import('../seed/seed.js').then(({ runSeed }) => {
           process.env.MONGODB_URI = uri; 
           runSeed(false).catch((err: any) => console.error('Seed error:', err));
        }).catch((err: any) => {
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
    inMemory: false,
  };
};

export const closeDB = async () => {
  await mongoose.connection.close();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

export default connectDB;
