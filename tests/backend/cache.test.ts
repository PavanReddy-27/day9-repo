import { describe, it, expect, beforeEach } from 'vitest';
import { CacheService } from '../../server/services/cacheService';

describe('Cache Invalidation and Management', () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService();
  });

  it('sets and retrieves cache entries', () => {
    cache.set('user:101', { name: 'John' });
    expect(cache.get('user:101')).toEqual({ name: 'John' });
  });

  it('invalidates single key', () => {
    cache.set('user:102', { name: 'Alice' });
    const deleted = cache.invalidateKey('user:102');
    expect(deleted).toBe(true);
    expect(cache.get('user:102')).toBeNull();
  });

  it('invalidates entries by tag', () => {
    cache.set('dept:1', { name: 'HR' }, undefined, ['department', 'org']);
    cache.set('dept:2', { name: 'Engineering' }, undefined, ['department', 'org']);
    cache.set('emp:1', { name: 'Bob' }, undefined, ['employee']);

    const count = cache.invalidateTag('department');
    expect(count).toBe(2);
    expect(cache.get('dept:1')).toBeNull();
    expect(cache.get('dept:2')).toBeNull();
    expect(cache.get('emp:1')).toEqual({ name: 'Bob' });
  });

  it('invalidates entries by pattern', () => {
    cache.set('analytics:daily:2026-01-01', { val: 100 });
    cache.set('analytics:daily:2026-01-02', { val: 120 });
    cache.set('user:profile', { val: 'admin' });

    const count = cache.invalidatePattern(/^analytics:daily:/);
    expect(count).toBe(2);
    expect(cache.get('analytics:daily:2026-01-01')).toBeNull();
    expect(cache.get('user:profile')).toEqual({ val: 'admin' });
  });

  it('expires entries after TTL', async () => {
    cache.set('temp:token', 'abc123', 50); // 50ms TTL
    expect(cache.get('temp:token')).toBe('abc123');

    await new Promise((res) => setTimeout(res, 60));
    expect(cache.get('temp:token')).toBeNull();
  });
});
