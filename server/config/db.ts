import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { execSync } from 'child_process';

let mongoServer: MongoMemoryServer | null = null;

const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      const conn = await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    }
    throw new Error('No MONGODB_URI provided');
  } catch (error) {
    console.warn(`Real MongoDB connection failed (${error.message}). Falling back to In-Memory DB...`);
    
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    const conn = await mongoose.connect(uri);
    console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
    
    // Seed the database if we're falling back to memory, but ONLY if we aren't already running the seed script
    if (!process.argv[1]?.includes('seed.ts')) {
      try {
        console.log('Running automatic seed for In-Memory DB...');
        console.log('Running automatic seed for In-Memory DB...');
        // Pass the new URI so the seed script connects to the SAME memory database!
        execSync('npm run seed', { 
          stdio: 'inherit',
          env: { ...process.env, MONGODB_URI: uri }
        });
      } catch (seedErr) {
        console.error('Failed to seed in-memory db', seedErr);
      }
    }
    
    return conn;
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
