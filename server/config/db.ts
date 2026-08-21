import mongoose from 'mongoose';
import { execSync } from 'child_process';

let memoryServer: any = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/workforce_analytics";
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log(`MongoDB Connected successfully`);
    return conn;
  } catch (error: any) {
    console.warn(`Primary MongoDB connection failed (${error.message}). Initializing In-Memory MongoDB fallback...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const fs = await import('fs');
      const os = await import('os');
      const path = await import('path');
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mongo-mem-'));
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: "workforce_analytics",
          launchTimeoutMS: 120000,
        },
      });
      const uri = memoryServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`In-Memory MongoDB Connected successfully for server execution`);
      return conn;
    } catch (fallbackError: any) {
      console.error(`In-Memory MongoDB fallback failed: ${fallbackError.message}`);
      if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
      }
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
