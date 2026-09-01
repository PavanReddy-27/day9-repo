import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import connectDB, { closeDB } from "./config/db.js";
import apiRoutes from "./routes/api.js";
import mongoose from "mongoose";
import { AdminAuth } from "./models/User.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet());

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
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
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts, please try again after 15 minutes." },
});
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/refresh", authLimiter);

import path from "path";

// Ensure DB Connection Middleware
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (dbErr: any) {
      console.error("[DB Connection Error]", dbErr.message);
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

if (process.argv[1]?.includes("index.ts")) {
  startServer();
}

export default app;
