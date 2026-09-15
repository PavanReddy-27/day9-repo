import { Request, Response, NextFunction } from 'express';

import { requestContext, logger } from '../utils/logger.js';
import SystemLog from '../models/SystemLog.js';

export const errorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`[Error Handler] ${message}`, {
    context: 'API',
    error: err,
    stack: err.stack,
  });

  if (statusCode >= 500) {
    const store = requestContext.getStore();
    await SystemLog.create({
      level: 'error',
      category: 'System',
      message: message,
      reqId: store?.get("requestId"),
      userId: store?.get("userId"),
      stack: err.stack,
      metadata: { path: req.path, method: req.method },
    }).catch((e) => logger.error("Failed to save SystemLog: " + e.message));
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
