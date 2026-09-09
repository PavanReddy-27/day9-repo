import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../server/app'; // Update if server is structured differently
import mongoose from 'mongoose';
import { User, EmployeeAuth } from '../../server/models/User';
import RefreshToken from '../../server/models/RefreshToken';

describe('Auth Security and Session Management', () => {
  let testUser: any;

  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/workforce_test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await RefreshToken.deleteMany({});

    testUser = await EmployeeAuth.create({
      email: 'testuser@stackly.com',
      password: 'Password123!',
      employeeId: 'EMP-TEST-001',
      role: 'Employee',
      companyId: new mongoose.Types.ObjectId(),
    });
  });

  it('should lock account after 5 failed login attempts', async () => {
    const loginPayload = { email: 'testuser@stackly.com', password: 'wrongpassword' };
    
    // Attempt 1 to 5
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post('/api/v1/auth/login').send(loginPayload);
      expect(res.status).toBe(401);
    }

    // Attempt 6 should return 403 locked
    const resLocked = await request(app).post('/api/v1/auth/login').send(loginPayload);
    expect(resLocked.status).toBe(403);
    expect(resLocked.body.message).toContain('temporarily locked');

    // Check DB
    const dbUser = await User.findById(testUser._id);
    expect(dbUser?.failedLoginAttempts).toBe(5);
    expect(dbUser?.lockUntil).toBeDefined();
  });

  it('should reset login attempts on successful login', async () => {
    // 1 failed attempt
    await request(app).post('/api/v1/auth/login').send({ email: 'testuser@stackly.com', password: 'wrongpassword' });
    
    let dbUser = await User.findById(testUser._id);
    expect(dbUser?.failedLoginAttempts).toBe(1);

    // 1 successful attempt
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'testuser@stackly.com', password: 'Password123!' });
    expect(res.status).toBe(200);

    dbUser = await User.findById(testUser._id);
    expect(dbUser?.failedLoginAttempts).toBe(0);
    expect(dbUser?.lockUntil).toBeUndefined();
  });

  it('should implement refresh token rotation and revoke family on reuse', async () => {
    const loginRes = await request(app).post('/api/v1/auth/login').send({ email: 'testuser@stackly.com', password: 'Password123!' });
    const cookies = loginRes.headers['set-cookie'];
    const refreshTokenCookie = cookies.find((c: string) => c.startsWith('refreshToken='));
    
    expect(refreshTokenCookie).toBeDefined();

    const refreshRes1 = await request(app).post('/api/v1/auth/refresh').set('Cookie', [refreshTokenCookie]);
    expect(refreshRes1.status).toBe(200);
    
    const newCookies = refreshRes1.headers['set-cookie'];
    const newRefreshTokenCookie = newCookies.find((c: string) => c.startsWith('refreshToken='));
    expect(newRefreshTokenCookie).toBeDefined();
    expect(newRefreshTokenCookie).not.toEqual(refreshTokenCookie);

    // Reuse old token
    const refreshRes2 = await request(app).post('/api/v1/auth/refresh').set('Cookie', [refreshTokenCookie]);
    expect(refreshRes2.status).toBe(401);
    expect(refreshRes2.body.message).toContain('reuse detected');

    // Legitimately rotated new token should now be revoked
    const refreshRes3 = await request(app).post('/api/v1/auth/refresh').set('Cookie', [newRefreshTokenCookie]);
    expect(refreshRes3.status).toBe(401);
  });

  it('should fetch active sessions', async () => {
    const loginRes = await request(app).post('/api/v1/auth/login').set('User-Agent', 'Test-Device-Info').send({ email: 'testuser@stackly.com', password: 'Password123!' });
    const accessToken = loginRes.body.data.accessToken;

    const sessionRes = await request(app)
      .get('/api/v1/auth/sessions')
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(sessionRes.status).toBe(200);
    expect(sessionRes.body.data).toHaveLength(1);
    expect(sessionRes.body.data[0].deviceInfo).toBe('Test-Device-Info');
  });

  it('should revoke a session', async () => {
    const loginRes = await request(app).post('/api/v1/auth/login').send({ email: 'testuser@stackly.com', password: 'Password123!' });
    const accessToken = loginRes.body.data.accessToken;

    const sessionRes = await request(app).get('/api/v1/auth/sessions').set('Authorization', `Bearer ${accessToken}`);
    const sessionId = sessionRes.body.data[0]._id;

    const revokeRes = await request(app).delete(`/api/v1/auth/sessions/${sessionId}`).set('Authorization', `Bearer ${accessToken}`);
    expect(revokeRes.status).toBe(200);

    const checkRes = await request(app).get('/api/v1/auth/sessions').set('Authorization', `Bearer ${accessToken}`);
    expect(checkRes.body.data).toHaveLength(0);
  });
});
