import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import connectDB, { closeDB } from "./config/db.js";
import apiRoutes from "./routes/api.js";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: "Too many requests from this IP, please try again later." },
});
app.use("/api/v1", apiLimiter);

// API Routes
app.use("/api/v1", apiRoutes);

// Centralized Error Handler
app.use((err: any, req, res, next) => {
  console.error("[Backend Error]", err.message, err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

let server;

async function startServer() {
  await connectDB();

  // Auto-migrate users for testing environments
  try {
    const usersCount = await mongoose.connection.collection('users').countDocuments();
    if (usersCount > 0) {
      console.log('Migrating users to role-based collections...');
      const users = await mongoose.connection.collection('users').find({}).toArray();
      for (const u of users) {
        try {
          if (u.role === 'Admin') await mongoose.connection.collection('adminauths').insertOne(u);
          else if (u.role === 'HR') await mongoose.connection.collection('hrauths').insertOne(u);
          else if (u.role === 'Manager') await mongoose.connection.collection('managerauths').insertOne(u);
          else if (u.role === 'Team Lead') await mongoose.connection.collection('teamleadauths').insertOne(u);
          else await mongoose.connection.collection('employeeauths').insertOne(u);
        } catch (insertErr: any) {
          if (insertErr.code !== 11000) {
            console.error('Error inserting user:', insertErr);
          }
        }
      }
      await mongoose.connection.collection('users').drop();
      console.log('Migration complete!');
    }
  } catch (err) {
    console.error('Migration failed:', err);
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
