import { fileURLToPath } from 'url';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB, { closeDB } from "./config/db.js";
import apiRoutes from "./routes/api.js";
import mongoose from "mongoose";
import { AdminAuth } from "./models/User.js";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet());
app.use(cookieParser());
import { requestLogger } from "./middleware/requestLogger.js";
app.use(requestLogger);

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

const isDev = process.env.NODE_ENV !== 'production';

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      if (isDev && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

// Global Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests from this IP, please try again later." },
});
app.use("/api/v1", apiLimiter);

// Strict Auth Rate Limiter — prevents brute-force login attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 50 : 1000,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts, please try again after 15 minutes." },
});
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/refresh", authLimiter);

import { logger } from "./utils/logger.js";
import SystemLog from "./models/SystemLog.js";

// __dirname is natively available in CommonJS
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (dbErr: any) {
      logger.error("[DB Connection Error] " + dbErr.message, { context: 'Database' });
      await SystemLog.create({
        level: 'error',
        category: 'Database',
        message: 'Database connection failed during request',
        stack: dbErr.stack,
      }).catch(() => {});
    }
  }
  next();
});

// API Routes
app.use("/api/v1", apiRoutes);

// Serve static frontend in production
app.use(express.static(path.join(__dirname, "../dist")));

app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

import { errorHandler } from './middleware/errorHandler.js';

// Centralized Error Handler — never leak stack traces or internal messages in production
app.use(errorHandler);

let server;

async function startServer() {
  await connectDB();

  try {
    const userCount = await AdminAuth.countDocuments();
    if (userCount === 0) {
      console.log("[Server] Database is empty. Seeding initial accounts...");
      const { runSeed } = await import("./seed/seed.js");
      await runSeed(false, false);
    }
  } catch (seedErr: any) {
    console.error("[Server] Auto-seed check error:", seedErr.message);
  }


  const currentPort = parseInt(PORT as string, 10);

  const tryListen = (portToTry) => {
    server = app
      .listen(portToTry, () => {
        console.log(`[Express Backend] Server running on http://localhost:${portToTry}`);
      })
      .on("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE") {
          console.warn(`[Server] Port ${portToTry} in use, trying port ${portToTry + 1}...`);
          tryListen(portToTry + 1);
        } else {
          console.error("[Server Error]", err);
        }
      });
  };

  tryListen(currentPort);

  // Graceful Shutdown
  const gracefulShutdown = async (signal) => {
    console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
    if (server) {
      server.close(async () => {
        await closeDB();
        console.log("[Server] Closed all connections.");
        process.exit(0);
      });
    } else {
      await closeDB();
      process.exit(0);
    }
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
}

if (process.env.NODE_ENV !== "test") {
  startServer().catch(console.error);
}

export default app;
