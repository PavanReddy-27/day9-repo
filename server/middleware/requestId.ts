import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      id?: string;
      correlationId?: string;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

/**
 * Middleware that assigns a unique Request ID (UUIDv4) to each incoming HTTP request,
 * attaches it to `req.id`, and exposes it in the response header `X-Request-Id`.
 * Middleware that assigns Request ID and Correlation ID to each incoming HTTP request,
 * attaches them to `req.id` and `req.correlationId`, and exposes them in response headers.
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const incomingRequestId = req.headers['x-request-id'] as string;
  const incomingCorrelationId = (req.headers['x-correlation-id'] || req.headers['x-request-id']) as string;

  const requestId = incomingRequestId && incomingRequestId.trim().length > 0 ? incomingRequestId.trim() : crypto.randomUUID();
  const correlationId = incomingCorrelationId && incomingCorrelationId.trim().length > 0 ? incomingCorrelationId.trim() : requestId;

  req.id = requestId;
  req.correlationId = correlationId;

  res.setHeader('X-Request-Id', requestId);
  res.setHeader('X-Correlation-Id', correlationId);

  next();
};

export default requestIdMiddleware;

