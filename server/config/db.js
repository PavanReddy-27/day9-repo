import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;
let mongoMemoryServerInstance = null;

export const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return mongoose.connection;

  const primaryUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/workforce_analytics";

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 2000,
      autoIndex: true,
    });

    isConnected = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn.connection;
  } catch (primaryError) {
    console.warn(`[MongoDB] Primary connection failed (${primaryError.message}). Attempting MongoMemoryServer fallback...`);

    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServerInstance.getUri();

      const conn = await mongoose.connect(memoryUri, { autoIndex: true });
      isConnected = true;
      console.log(`[MongoDB] Connected to in-memory fallback database at: ${memoryUri}`);
      return conn.connection;
    } catch (fallbackError) {
      console.error("[MongoDB] Failed to initialize in-memory database fallback:", fallbackError.message);
      process.exit(1);
    }
  }
};

export const getDBHealth = () => {
  const stateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  const stateCode = mongoose.connection.readyState;
  return {
    status: stateCode === 1 ? "healthy" : "unhealthy",
    state: stateMap[stateCode] || "unknown",
    host: mongoose.connection.host || null,
    dbName: mongoose.connection.name || null,
    isMemoryDB: !!mongoMemoryServerInstance,
    timestamp: new Date().toISOString(),
  };
};

export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log("[MongoDB] Database connection closed.");
    isConnected = false;
  }
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
    mongoMemoryServerInstance = null;
  }
};
