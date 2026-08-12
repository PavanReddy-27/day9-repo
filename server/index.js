import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { connectDB, closeDB } from "./config/db.js";
import apiRoutes from "./routes/api.js";

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
app.use((err, req, res, next) => {
  console.error("[Backend Error]", err.message, err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

let server;

async function startServer() {
  await connectDB();

  let currentPort = parseInt(PORT, 10);

  const tryListen = (portToTry) => {
    server = app
      .listen(portToTry, () => {
        console.log(`[Express Backend] Server running on http://localhost:${portToTry}`);
      })
      .on("error", (err) => {
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

if (process.argv[1]?.includes("index.js")) {
  startServer();
}

export default app;
