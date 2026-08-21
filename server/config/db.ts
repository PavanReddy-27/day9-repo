import mongoose from 'mongoose';
import { execSync } from 'child_process';

const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      const conn = await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      console.log(`MongoDB Connected successfully`);
      return conn;
    }
    throw new Error('No MONGODB_URI provided');
  } catch (error) {
    console.error(`Real MongoDB connection failed (${error.message}). Exiting...`);
    process.exit(1);
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
};

export default connectDB;
