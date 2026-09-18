export interface CacheEntry<T = any> {
  value: T;
  expiresAt?: number;
  tags?: string[];
}

export class CacheService {
  private store: Map<string, CacheEntry> = new Map();

  set<T>(key: string, value: T, ttlMs?: number, tags?: string[]): void {
    const expiresAt = ttlMs ? Date.now() + ttlMs : undefined;
    this.store.set(key, { value, expiresAt, tags });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  invalidateKey(key: string): boolean {
    return this.store.delete(key);
  }

  invalidateTag(tag: string): number {
    let count = 0;
    for (const [key, entry] of this.store.entries()) {
      if (entry.tags && entry.tags.includes(tag)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  invalidatePattern(pattern: RegExp | string): number {
    let count = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

export const defaultCache = new CacheService();
export default defaultCache;
