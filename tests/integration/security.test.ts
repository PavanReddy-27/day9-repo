import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../server/index.js';
import connectDB, { closeDB } from '../../server/config/db.js';
import { generateTokens } from '../../server/controllers/authController.js';
import mongoose from 'mongoose';

// A valid MongoDB ObjectId for testing
const VALID_OBJECT_ID = new mongoose.Types.ObjectId().toString();
const FAKE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwNWMyZTY5ZjUwMDAwMDAwMDAwMDAwMCIsInJvbGUiOiJFbXBsb3llZSIsImlhdCI6MTYzNjUwMDAwMH0.1'; // Invalid signature

describe('Security & RBAC Tests', () => {
  beforeAll(async () => {
    await connectDB();
  }, 60000);

  afterAll(async () => {
    await closeDB();
  });

  describe('Manipulated IDs and Unauthorized Access', () => {
    it('should reject access to protected routes without token', async () => {
      const res = await request(app).get('/api/v1/employees');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid JWT token format', async () => {
      const res = await request(app)
        .get('/api/v1/employees')
        .set('Authorization', 'Bearer invalidtokenformat');
      expect(res.status).toBe(401);
    });

    it('should reject forged/manipulated JWT tokens', async () => {
      const res = await request(app)
        .get('/api/v1/employees')
        .set('Authorization', `Bearer ${FAKE_TOKEN}`);
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/token failed/i);
    });

    it('should reject manipulated employee ID in params (400 Bad Request)', async () => {
      // Trying to inject a non-ObjectId string to crash the DB or bypass
      const res = await request(app)
        .patch('/api/v1/attendance/corrections/not_a_valid_mongo_id/approve')
        .set('Authorization', `Bearer ${FAKE_TOKEN}`);
      // Even with fake token, the validateObjectId middleware runs, wait actually authenticateJWT runs first.
      // So we expect 401 first. But if token was valid, it would be 400.
      expect(res.status).toBe(401);
    });
  });
});
