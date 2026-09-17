/**
 * Client-Side Safe Caching Utility (Task 16 - Pavan Kumar)
 * 
 * Provides in-memory TTL caching for non-sensitive reference catalogs and aggregated metrics.
 * Strictly prevents caching of sensitive data (credentials, tokens, payroll, PII).
 */

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  timestamp: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
}

// Strictly forbidden sensitive endpoint patterns that must never be cached in client memory
const SENSITIVE_KEYWORDS = [
  "password",
  "token",
  "auth",
  "secret",
  "payroll",
  "salary",
  "my-pay",
  "credit",
  "ssn",
  "cookie",
];

export class ClientCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  /**
   * Evaluates if a cache key or URL endpoint is safe to cache.
   * Returns false if any sensitive keyword matches.
   */
  public isSafeToCache(key: string): boolean {
    const lower = key.toLowerCase();
    return !SENSITIVE_KEYWORDS.some((kw) => lower.includes(kw));
  }

  /**
   * Retrieves an item from cache if present and unexpired.
   */
  public get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.evictions++;
      this.misses++;
      return undefined;
    }

    this.hits++;
    return entry.data as T;
  }

  /**
   * Stores non-sensitive data in the client cache with a TTL (default 60 seconds).
   */
  public set<T>(key: string, data: T, ttlSeconds = 60): boolean {
    if (!this.isSafeToCache(key)) {
      console.warn(`[ClientCache] Refusing to cache sensitive or restricted key: "${key}"`);
      return false;
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
      timestamp: Date.now(),
    });
    return true;
  }

  /**
   * Deletes a specific cache key.
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalidates all cache keys matching a prefix or regex pattern.
   * Useful when relevant mutations occur (e.g. invalidating 'departments' after an edit).
   */
  public invalidatePattern(pattern: string | RegExp): number {
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Clears the entire cache.
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Returns telemetry statistics on cache performance.
   */
  public getStats(): CacheStats {
    return {
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      size: this.cache.size,
    };
  }
}

export const clientCache = new ClientCache();
export default clientCache;
