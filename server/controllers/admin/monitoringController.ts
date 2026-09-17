import { Request, Response } from "express";
import SystemLog from "../../models/SystemLog.js";
import RefreshToken from "../../models/RefreshToken.js";
import mongoose from "mongoose";

import { getAverageResponseTime } from "../../middleware/requestLogger.js";
import { getConnectedClientsCount } from "../../utils/sse.js";

export const getSystemHealth = async (req: Request, res: Response) => {
  try {
    // 1. DB Health
    const dbState = mongoose.connection.readyState;
    const isDbHealthy = dbState === 1;

    // 2. Active Sessions (Refresh Tokens that haven't expired)
    const activeSessions = await RefreshToken.countDocuments({
      expiresAt: { $gt: new Date() },
    });

    // 3. Error counts last 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const errorAggregation = await SystemLog.aggregate([
      { $match: { timestamp: { $gte: yesterday }, level: { $in: ["warn", "error", "fatal"] } } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const errorCounts: Record<string, number> = {
      Auth: 0,
      Attendance: 0,
      Notification: 0,
      Database: 0,
      System: 0,
      API: 0
    };
    
    errorAggregation.forEach(group => {
      if (errorCounts[group._id] !== undefined) {
        errorCounts[group._id] = group.count;
      }
    });

    // Background job status (latest background job log)
    const latestJob = await SystemLog.findOne({ category: "BackgroundJob" })
      .sort({ timestamp: -1 })
      .lean();

    const backgroundJobStatus = latestJob ? 
      (latestJob.level === "info" ? "Success" : "Failed") : 
      "Never Run";

    // We can also fetch the most recent errors for a data grid
    const recentErrors = await SystemLog.find({ level: { $in: ["warn", "error", "fatal"] } })
      .sort({ timestamp: -1 })
      .limit(50)
      .populate("userId", "email firstName lastName")
      .lean();

    res.status(200).json({
      success: true,
      data: {
        health: {
          database: isDbHealthy ? "healthy" : "down",
          api: "healthy",
        },
        avgResponseTime: getAverageResponseTime(),
        connectedClients: getConnectedClientsCount(),
        backgroundJobStatus,
        activeSessions,
        errorCounts,
        recentErrors
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitJobLog = async (req: Request, res: Response) => {
  try {
    const { message, level, details } = req.body;
    await SystemLog.create({
      level: level || "info",
      category: "BackgroundJob",
      message: message || "Background job executed",
      metadata: details
    });
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
