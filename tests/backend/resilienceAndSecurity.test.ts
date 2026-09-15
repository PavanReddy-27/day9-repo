import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../server/index.js';
import connectDB, { closeDB } from '../../server/config/db.js';
import { generateAccessToken } from '../../server/controllers/authController.js';
import Company from '../../server/models/Company.js';
import { AdminAuth, EmployeeAuth } from '../../server/models/User.js';
import Employee from '../../server/models/Employee.js';
import { appCache } from '../../server/utils/cache.js';

describe('Resilience, Caching, Soft Deletion & Export Security Suite (Task 16)', () => {
  let testCompany: any;
  let adminToken: string;
  let employeeToken: string;
  let activeUser: any;
  let deactivatedUser: any;
  let deletedUser: any;

  beforeAll(async () => {
    await connectDB();
    testCompany = await Company.create({ name: 'Resilience Co', code: 'RES_' + Date.now() });
    const companyId = testCompany._id;

    // 1. Active Admin
    const adminUser = await AdminAuth.create({
      email: `admin-resilience-${Date.now()}@stackly.com`,
      password: 'Password123!',
      role: 'Admin',
      companyId,
      employeeId: `EMP-ADM-${Date.now()}`,
    });
    adminToken = generateAccessToken(adminUser._id, 'Admin');

    // 2. Active Employee
    activeUser = await EmployeeAuth.create({
      email: `emp-active-${Date.now()}@stackly.com`,
      password: 'Password123!',
      role: 'Employee',
      companyId,
      employeeId: `EMP-ACT-${Date.now()}`,
    });
    employeeToken = generateAccessToken(activeUser._id, 'Employee');

    // 3. Deactivated / Disabled User
    deactivatedUser = await EmployeeAuth.create({
      email: `emp-deactivated-${Date.now()}@stackly.com`,
      password: 'Password123!',
      role: 'Employee',
      companyId,
      employeeId: `EMP-DIS-${Date.now()}`,
      isActive: false,
    });

    // 4. Soft-Deleted User
    deletedUser = await EmployeeAuth.create({
      email: `emp-deleted-${Date.now()}@stackly.com`,
      password: 'Password123!',
      role: 'Employee',
      companyId,
      employeeId: `EMP-DEL-${Date.now()}`,
      isDeleted: true,
      deletedAt: new Date(),
    });
  }, 30000);

  afterAll(async () => {
    if (activeUser?._id) await EmployeeAuth.findByIdAndDelete(activeUser._id);
    if (deactivatedUser?._id) await EmployeeAuth.findByIdAndDelete(deactivatedUser._id);
    if (deletedUser?._id) await EmployeeAuth.findByIdAndDelete(deletedUser._id);
    if (testCompany?._id) await Company.findByIdAndDelete(testCompany._id);
    await closeDB();
  });

  // 1. Soft Deletion & Disabled Users Authentication Rejection
  it('rejects authentication for deactivated users with 403 Forbidden', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: deactivatedUser.email,
      password: 'Password123!',
    });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/deactivated|disabled/i);
  });

  it('rejects authentication for soft-deleted users with 403 Forbidden', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: deletedUser.email,
      password: 'Password123!',
    });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/deleted|deactivated/i);
  });

  // 2. Safe Caching & Pattern-Based Invalidation
  it('caches non-sensitive data and supports pattern-based invalidation', () => {
    const key1 = 'analytics:test_comp:kpi';
    const key2 = 'analytics:test_comp:trends';
    const otherKey = 'departments:global:list';

    appCache.set(key1, { kpiValue: 98 }, 60);
    appCache.set(key2, { trend: 'up' }, 60);
    appCache.set(otherKey, [{ name: 'Engineering' }], 60);

    expect(appCache.get(key1)).toEqual({ kpiValue: 98 });
    expect(appCache.get(key2)).toEqual({ trend: 'up' });
    expect(appCache.get(otherKey)).toBeDefined();

    // Invalidate pattern
    appCache.invalidatePattern('^analytics:test_comp:');

    expect(appCache.get(key1)).toBeUndefined();
    expect(appCache.get(key2)).toBeUndefined();
    expect(appCache.get(otherKey)).toBeDefined(); // Other category remains intact
  });

  // 3. Export Authorization Rejection
  it('strictly restricts system audit exports to Admin role only', async () => {
    // Unauthenticated -> 401
    const unauth = await request(app).post('/api/v1/system/export').send({
      exportType: 'audit_logs',
    });
    expect(unauth.status).toBe(401);

    // Employee -> 403 Forbidden
    const forbidden = await request(app)
      .post('/api/v1/system/export')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ exportType: 'audit_logs' });
    expect(forbidden.status).toBe(403);

    // Admin -> 200 OK with SHA-256 integrity hash
    const res = await request(app)
      .post('/api/v1/system/export')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ exportType: 'audit_logs' });
    expect(res.status).toBe(200);
    expect(res.headers['x-checksum-sha256']).toBeDefined();
    expect(res.headers['x-checksum-sha256']).toHaveLength(64); // Valid SHA-256 hex string
    const records = JSON.parse(res.text);
    expect(Array.isArray(records)).toBe(true);
  });
});
