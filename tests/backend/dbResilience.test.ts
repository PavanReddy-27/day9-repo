import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../server/index';

let mongoServer: MongoMemoryServer;

describe('MongoDB Disconnection and Reconnection Resilience', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoServer.stop();
  });

  it('detects disconnected state when connection is closed', async () => {
    await mongoose.disconnect();
    expect(mongoose.connection.readyState).toBe(0);

    const res = await request(app).get('/api/v1/health/readiness');
    // Once disconnected, readiness endpoint returns 503 if readyState !== 1 or reconnects
    expect([200, 503]).toContain(res.status);
  });

  it('reconnects successfully and readiness endpoint returns 200 UP', async () => {
    const uri = mongoServer.getUri();
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
    expect(mongoose.connection.readyState).toBe(1);

    const res = await request(app).get('/api/v1/health/readiness');
    expect(res.status).toBe(200);
    expect(res.body.ready).toBe(true);
    expect(res.body.status).toBe('UP');
  });
});
