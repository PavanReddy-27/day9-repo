import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

/**
 * Middleware that assigns a unique Request ID (UUIDv4) to each incoming HTTP request,
 * attaches it to `req.id`, and exposes it in the response header `X-Request-Id`.
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const incomingId = req.headers['x-request-id'] as string;
  const requestId = incomingId && incomingId.trim().length > 0 ? incomingId.trim() : crypto.randomUUID();

  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);

  next();
};

export default requestIdMiddleware;

