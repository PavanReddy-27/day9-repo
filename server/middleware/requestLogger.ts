import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { requestContext, logger, requestMetrics } from "../utils/logger.js";

const responseTimes: number[] = [];
export const getAverageResponseTime = () => {
  if (responseTimes.length === 0) return 0;
  return Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const store = new Map<string, any>();
  const requestId = req.headers["x-request-id"] || uuidv4();
  
  store.set("requestId", requestId);
  
  // Set any auth info if available early (usually it's set in auth middleware later)
  // But we can initialize the store so subsequent middlewares can update it.

  requestContext.run(store, () => {
    const start = Date.now();
    
    res.on("finish", () => {
      const duration = Date.now() - start;
      
      // Update rolling average
      responseTimes.push(duration);
      if (responseTimes.length > 100) responseTimes.shift();
      
      // Update system metrics
      requestMetrics.record(res.statusCode, duration);

      // Attempt to extract userId and companyId if set by auth middleware
      const userId = (req as any).user?.id || (req as any).employee?._id;
      const companyId = (req as any).companyId || (req as any).user?.companyId;

      if (userId) store.set("userId", userId);
      if (companyId) store.set("orgId", companyId);

      const logLevel = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
      
      logger.log(logLevel, `[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, {
        context: 'API',
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        durationMs: duration,
        userId: userId,
        orgId: companyId,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
    });

    next();
  });
};
