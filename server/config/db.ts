import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { execSync } from 'child_process';

let mongoServer: MongoMemoryServer | null = null;

const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      const conn = await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      console.log(`MongoDB Connected successfully`);
      return conn;
    }
    throw new Error('No MONGODB_URI provided');
  } catch (error) {
    console.warn(`Real MongoDB connection failed (${error.message}). Falling back to In-Memory DB...`);
    
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    const conn = await mongoose.connect(uri);
    console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
    
    console.log(`Running automatic seed for In-Memory DB...`);
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      await execAsync('npm run seed', { env: { ...process.env, MONGODB_URI: uri } });
      console.log('Automatic seed complete!');
    } catch (e) {
      console.error('Failed to run seed script automatically:', e);
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
