import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../server/index.js';
import connectDB, { closeDB } from '../../server/config/db.js';
import mongoose from 'mongoose';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // In-memory DB connection is handled gracefully by connectDB if no URI
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  describe('GET /api/v1/health', () => {
    it('should return 200 OK and healthy status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('Auth Flow', () => {
    it('should reject invalid login', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'wrongpassword' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with 400 on malformed body due to Zod validation', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'notanemail', password: '123' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });
  });
});
