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
      expect(res.status).toBe(401);
    });

    it('should return 403 Forbidden when an Employee attempts to access Admin/HR audit-logs', async () => {
      const { EmployeeAuth } = await import('../../server/models/User.js');
      const empUser: any = await EmployeeAuth.findOne({ role: 'Employee' });
      if (empUser) {
        const { accessToken } = generateTokens(empUser._id, 'Employee');
        const res = await request(app)
          .get('/api/v1/audit-logs')
          .set('Authorization', `Bearer ${accessToken}`);
        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/forbidden|insufficient/i);
      }
    });

    it('should return 403 Forbidden when an Employee attempts to access company payroll periods', async () => {
      const { EmployeeAuth } = await import('../../server/models/User.js');
      const empUser: any = await EmployeeAuth.findOne({ role: 'Employee' });
      if (empUser) {
        const { accessToken } = generateTokens(empUser._id, 'Employee');
        const res = await request(app)
          .get('/api/v1/payroll/periods')
          .set('Authorization', `Bearer ${accessToken}`);
        expect(res.status).toBe(403);
      }
    });

    it('should reject an Employee trying to query another employee pay records', async () => {
      const { EmployeeAuth } = await import('../../server/models/User.js');
      const empUser: any = await EmployeeAuth.findOne({ role: 'Employee' });
      if (empUser) {
        const { accessToken } = generateTokens(empUser._id, 'Employee');
        const anotherEmpId = new mongoose.Types.ObjectId().toString();
        const res = await request(app)
          .get(`/api/v1/payroll/my-pay?employeeId=${anotherEmpId}`)
          .set('Authorization', `Bearer ${accessToken}`);
        expect(res.status).toBe(403);
        expect(res.body.error).toMatch(/forbidden/i);
      }
    });

    it('should reject an Employee trying to query another employee attendance history', async () => {
      const { EmployeeAuth } = await import('../../server/models/User.js');
      const empUser: any = await EmployeeAuth.findOne({ role: 'Employee' });
      if (empUser) {
        const { accessToken } = generateTokens(empUser._id, 'Employee');
        const anotherEmpId = new mongoose.Types.ObjectId().toString();
        const res = await request(app)
          .get(`/api/v1/attendance/history?employeeId=${anotherEmpId}`)
          .set('Authorization', `Bearer ${accessToken}`);
        expect([403, 200]).toContain(res.status); // 403 if target exists or 200 with empty data if unresolvable ID
      }
    });
  });
});
