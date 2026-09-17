import { describe, it, expect, beforeEach } from "vitest";
import { clientCache, ClientCache } from "./clientCache";

describe("ClientCache Suite (Task 16 - Pavan Kumar)", () => {
  let cache: ClientCache;

  beforeEach(() => {
    cache = new ClientCache();
    clientCache.clear();
  });

  it("exports default singleton instance", () => {
    expect(clientCache).toBeDefined();
    expect(clientCache.getStats().size).toBe(0);
  });

  it("stores and retrieves non-sensitive data correctly", () => {
    const key = "/api/v1/departments";
    const data = [{ id: 1, name: "Engineering" }, { id: 2, name: "Marketing" }];

    const stored = cache.set(key, data, 60);
    expect(stored).toBe(true);

    const retrieved = cache.get<typeof data>(key);
    expect(retrieved).toEqual(data);

    const stats = cache.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(0);
    expect(stats.size).toBe(1);
  });

  it("refuses to cache sensitive endpoints (passwords, tokens, payroll, salary)", () => {
    const sensitiveKeys = [
      "/api/v1/auth/login",
      "/api/v1/auth/refresh",
      "/api/v1/payroll/my-pay",
      "/api/v1/employees/salary-records",
      "user_password_hash",
    ];

    sensitiveKeys.forEach((key) => {
      const stored = cache.set(key, { secret: "do-not-cache" });
      expect(stored).toBe(false);
      expect(cache.get(key)).toBeUndefined();
    });

    expect(cache.getStats().size).toBe(0);
  });

  it("expires items after TTL exceeds", async () => {
    const key = "/api/v1/system/health";
    // 0.05 seconds TTL
    cache.set(key, { status: "healthy" }, 0.05);

    expect(cache.get(key)).toEqual({ status: "healthy" });

    // Wait 70ms for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 70));

    expect(cache.get(key)).toBeUndefined();
    expect(cache.getStats().evictions).toBe(1);
    expect(cache.getStats().misses).toBe(1);
  });

  it("invalidates cache items by pattern or prefix", () => {
    cache.set("/api/v1/departments/loc-1", { dept: "Eng" }, 60);
    cache.set("/api/v1/departments/loc-2", { dept: "Sales" }, 60);
    cache.set("/api/v1/locations/list", [{ id: 1 }], 60);

    expect(cache.getStats().size).toBe(3);

    // Invalidate only departments
    const invalidated = cache.invalidatePattern("/api/v1/departments");
    expect(invalidated).toBe(2);

    expect(cache.get("/api/v1/departments/loc-1")).toBeUndefined();
    expect(cache.get("/api/v1/departments/loc-2")).toBeUndefined();
    expect(cache.get("/api/v1/locations/list")).toBeDefined();
  });

  it("clears all cache entries on clear()", () => {
    cache.set("/api/v1/shifts", [{ id: 1 }], 60);
    cache.set("/api/v1/locations", [{ id: 2 }], 60);
    expect(cache.getStats().size).toBe(2);

    cache.clear();
    expect(cache.getStats().size).toBe(0);
  });
});
