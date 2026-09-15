import { Request, Response, NextFunction } from 'express';
import { redactSensitiveData } from './redact.js';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  requestId?: string;
  method?: string;
  url?: string;
  status?: number;
  durationMs?: number;
  user?: {
    id?: string;
    role?: string;
  };
  context?: Record<string, any>;
}

class StructuredLogger {
  private serviceName = 'workforce-analytics-api';

  private emit(log: StructuredLog): void {
    const serialized = JSON.stringify(redactSensitiveData(log));
    if (log.level === 'error') {
      console.error(serialized);
    } else if (log.level === 'warn') {
      console.warn(serialized);
    } else {
      console.log(serialized);
    }
  }

  public info(message: string, context?: Record<string, any>, requestId?: string): void {
    this.emit({
      timestamp: new Date().toISOString(),
      level: 'info',
      service: this.serviceName,
      message,
      requestId,
      context,
    });
  }

  public warn(message: string, context?: Record<string, any>, requestId?: string): void {
    this.emit({
      timestamp: new Date().toISOString(),
      level: 'warn',
      service: this.serviceName,
      message,
      requestId,
      context,
    });
  }

  public error(message: string, context?: Record<string, any>, requestId?: string): void {
    this.emit({
      timestamp: new Date().toISOString(),
      level: 'error',
      service: this.serviceName,
      message,
      requestId,
      context,
    });
  }

  public debug(message: string, context?: Record<string, any>, requestId?: string): void {
    if (process.env.NODE_ENV !== 'production') {
      this.emit({
        timestamp: new Date().toISOString(),
        level: 'debug',
        service: this.serviceName,
        message,
        requestId,
        context,
      });
    }
  }
}

export const logger = new StructuredLogger();

// In-memory traffic window for telemetry
export const requestMetrics = {
  totalRequests: 0,
  status2xx: 0,
  status4xx: 0,
  status5xx: 0,
  latencies: [] as number[],
  get p95Latency(): number {
    if (this.latencies.length === 0) return 0;
    const sorted = [...this.latencies].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return Math.round(sorted[index] ?? 0);
  },
  record(status: number, durationMs: number): void {
    this.totalRequests++;
    if (status >= 500) this.status5xx++;
    else if (status >= 400) this.status4xx++;
    else if (status >= 200) this.status2xx++;

    this.latencies.push(durationMs);
    if (this.latencies.length > 500) {
      this.latencies.shift();
    }
  }
};

/**
 * Express Request Logger Middleware
 * Correlates request IDs, measures duration, logs completion, and records traffic telemetry.
 */
export const httpLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Skip logging high-frequency automated health check polling from cluttering console
  const isProbe = req.path === '/health' || req.path === '/ready' || req.path === '/api/v1/health' || req.path === '/api/v1/ready';
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    requestMetrics.record(res.statusCode, durationMs);

    if (!isProbe) {
      logger.info(`${req.method} ${req.originalUrl || req.url} ${res.statusCode} in ${durationMs}ms`, {
        method: req.method,
        url: req.originalUrl || req.url,
        status: res.statusCode,
        durationMs,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      }, req.id);
    }
  });

  next();
};

export default logger;

