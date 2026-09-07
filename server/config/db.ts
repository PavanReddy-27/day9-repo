import mongoose from 'mongoose';
import { MongoMemoryReplSet, MongoMemoryServer } from 'mongodb-memory-server';
import dns from 'dns';

// Configure resilient DNS resolution for MongoDB Atlas SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Ignore if not permitted
}

let memoryServer: MongoMemoryReplSet | any = null;
let connectionPromise: Promise<any> | null = null;

const connectDB = async () => {
  // 1: connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If a connection attempt is already in flight, reuse the same promise to prevent multiple openUri() calls
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/workforce_analytics";
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
      });
      console.log('MongoDB Connected successfully.');
      return conn;
    } catch (error: any) {
      console.warn(`Primary MongoDB connection failed (${error.message}). Initializing In-Memory MongoDB fallback...`);
      try {
        // Disconnect any active/stale connection before opening with a different URI
        if (mongoose.connection.readyState !== 0) {
          try {
            await mongoose.disconnect();
          } catch (_err) {
            // Ignore error when disconnecting stale connection
          }
        }

        if (!memoryServer) {
          memoryServer = await MongoMemoryServer.create({
            instance: {
              dbName: "workforce_analytics",
            } as any,
          });
        }
        const uri = memoryServer.getUri();
        const conn = await mongoose.connect(uri);
        console.log('In-Memory MongoDB Connected successfully for server execution');
        return conn;
      } catch (fallbackError: any) {
        console.error(`In-Memory MongoDB fallback failed: ${fallbackError.message}`);
        throw fallbackError;
      }
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
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
    inMemory: Boolean(memoryServer),
  };
};

export const closeDB = async () => {
  await mongoose.connection.close();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

export { connectDB };
export default connectDB;
