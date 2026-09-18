import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../server/index';

let mongoServer: MongoMemoryServer;

describe('Load and Performance Behaviour Under Stress', () => {
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

  it('handles 50 concurrent health check requests under 1500ms total', async () => {
    const startTime = Date.now();
    const requests = Array.from({ length: 50 }).map(() => request(app).get('/api/v1/health'));

    const responses = await Promise.all(requests);
    const totalDuration = Date.now() - startTime;

    expect(responses).toHaveLength(50);
    responses.forEach((res) => {
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });

    expect(totalDuration).toBeLessThan(1500);
  });
});
