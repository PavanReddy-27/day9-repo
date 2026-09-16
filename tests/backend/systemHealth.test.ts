import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../server/index.js';
import connectDB, { closeDB } from '../../server/config/db.js';
import { generateAccessToken } from '../../server/controllers/authController.js';
import Company from '../../server/models/Company.js';
import { AdminAuth, EmployeeAuth } from '../../server/models/User.js';

describe('System Health, Probes & Observability Suite (Task 16)', () => {
  let adminToken: string;
  let employeeToken: string;
  let adminUser: any;
  let employeeUser: any;
  let testCompany: any;

  beforeAll(async () => {
    await connectDB();
    testCompany = await Company.create({ name: 'Health Co', code: 'HLT_' + Date.now() });
    const companyId = testCompany._id;

    adminUser = await AdminAuth.create({
      email: `admin-health-${Date.now()}@stackly.com`,
      password: 'Password123!',
      role: 'Admin',
      companyId,
      employeeId: `EMP-ADM-${Date.now()}`,
    });

    employeeUser = await EmployeeAuth.create({
      email: `emp-health-${Date.now()}@stackly.com`,
      password: 'Password123!',
      role: 'Employee',
      companyId,
      employeeId: `EMP-USR-${Date.now()}`,
    });

    adminToken = generateAccessToken(adminUser._id, 'Admin');
    employeeToken = generateAccessToken(employeeUser._id, 'Employee');
  }, 30000);

  afterAll(async () => {
    if (adminUser?._id) await AdminAuth.findByIdAndDelete(adminUser._id);
    if (employeeUser?._id) await EmployeeAuth.findByIdAndDelete(employeeUser._id);
    if (testCompany?._id) await Company.findByIdAndDelete(testCompany._id);
    await closeDB();
  });

  it('GET /health returns liveness probe with 200 OK and memory telemetry', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(res.body.memory).toHaveProperty('heapUsedMB');
    expect(res.body.memory).toHaveProperty('heapTotalMB');
    expect(res.body.memory).toHaveProperty('rssMB');
  });

  it('GET /ready returns readiness probe with database connection state', async () => {
    const res = await request(app).get('/ready');
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('status');
    expect(res.body.database).toHaveProperty('connected');
  });

  it('GET /version returns build metadata, environment and node details', async () => {
    const res = await request(app).get('/version');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'workforce-analytics');
    expect(res.body).toHaveProperty('nodeVersion');
    expect(res.body).toHaveProperty('platform');
    expect(res.body).toHaveProperty('environment');
  });

  it('Injects and propagates X-Request-Id header across requests', async () => {
    const customId = 'test-req-id-12345';
    const res = await request(app).get('/health').set('X-Request-Id', customId);
    expect(res.headers['x-request-id']).toBe(customId);
  });

  it('GET /api/v1/system/metrics requires Admin role and returns detailed system stats', async () => {
    // Unauthenticated -> 401
    const unauth = await request(app).get('/api/v1/system/metrics');
    expect(unauth.status).toBe(401);

    // Employee -> 403 Forbidden
    const forbidden = await request(app)
      .get('/api/v1/system/metrics')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect(forbidden.status).toBe(403);

    // Admin -> 200 OK with metrics
    const res = await request(app)
      .get('/api/v1/system/metrics')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('server');
    expect(res.body.data).toHaveProperty('memory');
    expect(res.body.data).toHaveProperty('database');
    expect(res.body.data).toHaveProperty('traffic');
    expect(res.body.data.traffic).toHaveProperty('availabilityPct');
    expect(res.body.data.traffic).toHaveProperty('avgLatencyMs');
    expect(res.body.data).toHaveProperty('monitoring');
    expect(res.body.data.monitoring).toHaveProperty('activeSessions');
    expect(res.body.data.monitoring).toHaveProperty('connectedClients');
    expect(res.body.data.monitoring).toHaveProperty('failedLogins');
    expect(res.body.data.monitoring).toHaveProperty('lockedAccounts');
    expect(res.body.data.monitoring).toHaveProperty('offlineSyncFailures');
    expect(res.body.data.monitoring).toHaveProperty('notificationFailures');
    expect(res.body.data.monitoring).toHaveProperty('recentFailedLogins');
    expect(res.body.data.monitoring).toHaveProperty('recentLockedAccounts');
  });

  it('POST /api/v1/system/test-ping records real latency and returns updated traffic stats', async () => {
    const res = await request(app)
      .post('/api/v1/system/test-ping')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.metrics).toHaveProperty('totalRequests');
    expect(res.body.metrics.totalRequests).toBeGreaterThan(0);
  });

  it('POST /api/v1/system/test-sse-ping broadcasts live ping and returns active connected count', async () => {
    const res = await request(app)
      .post('/api/v1/system/test-sse-ping')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('connectedClients');
  });

  it('POST /api/v1/system/test-notification dispatches real-time test notification', async () => {
    const res = await request(app)
      .post('/api/v1/system/test-notification')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Test Alert', message: 'Verifying notification dispatch', type: 'INFO' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
  });
});
