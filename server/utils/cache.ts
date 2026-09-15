/**
 * In-Memory Safe Caching Utility for Non-Sensitive Analytics and Catalogs (Task 16 - Pavan Kumar)
 * Provides TTL-based caching and pattern-based invalidation for high-read endpoints.
 */
import { Request, Response, NextFunction } from 'express';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  public get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.data as T;
  }

  public set<T>(key: string, data: T, ttlSeconds = 60): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  public del(key: string): void {
    this.cache.delete(key);
  }

  public invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

export const appCache = new MemoryCache();

/**
 * Express Middleware for Safe Caching of Non-Sensitive Data
 */
export const cacheMiddleware = (keyPrefix: string, ttlSeconds = 60) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Only cache safe GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const companyId = (req as any).user?.companyId || (req as any).companyId || 'global';
    const cacheKey = `${keyPrefix}:${companyId}:${req.originalUrl || req.url}`;

    const cached = appCache.get<any>(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.status(200).json(cached);
      return;
    }

    // Intercept res.json to store into cache
    const originalJson = res.json.bind(res);
    res.json = (body: any): Response => {
      res.setHeader('X-Cache', 'MISS');
      if (res.statusCode >= 200 && res.statusCode < 300) {
        appCache.set(cacheKey, body, ttlSeconds);
      }
      return originalJson(body);
    };

    next();
  };
};

export default appCache;

