import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../server/index';

let mongoServer: MongoMemoryServer;

describe('Health and Readiness Endpoints', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('GET /api/v1/health returns 200 when healthy', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
  });

  it('GET /api/v1/health/readiness returns 200 UP when DB connected', async () => {
    const res = await request(app).get('/api/v1/health/readiness');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.ready).toBe(true);
  });

  it('GET /api/v1/readiness returns 200 UP when DB connected', async () => {
    const res = await request(app).get('/api/v1/readiness');
    expect(res.status).toBe(200);
    expect(res.body.ready).toBe(true);
  });
});
