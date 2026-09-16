import { describe, it, expect, vi } from 'vitest';
import { redactSensitiveData } from '../../server/utils/redact.js';
import { requestIdMiddleware } from '../../server/middleware/requestId.js';
import { logger, requestMetrics } from '../../server/utils/logger.js';

describe('Centralized Monitoring & Logging Suite (Task 16)', () => {
  describe('Sensitive-field redaction', () => {
    it('redacts passwords, secrets, and auth tokens', () => {
      const payload = {
        username: 'john_doe',
        password: 'PlainTextPassword123!',
        passwd: 'secret_passwd',
        passwordHash: '$2a$12$e8Yk2u...',
        token: 'auth-token-12345',
        accessToken: 'access-token-67890',
        refreshToken: 'refresh-token-abcdef',
        mfaSecret: 'JBSWY3DPEHPK3PXP',
        apiKey: 'sk-live-abcdef1234567890',
      };

      const sanitized = redactSensitiveData(payload);

      expect(sanitized.username).toBe('john_doe');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.passwd).toBe('[REDACTED]');
      expect(sanitized.passwordHash).toBe('[REDACTED]');
      expect(sanitized.token).toBe('[REDACTED]');
      expect(sanitized.accessToken).toBe('[REDACTED]');
      expect(sanitized.refreshToken).toBe('[REDACTED]');
      expect(sanitized.mfaSecret).toBe('[REDACTED]');
      expect(sanitized.apiKey).toBe('[REDACTED]');
    });

    it('redacts payroll and compensation data', () => {
      const payrollData = {
        employeeName: 'Sarah Connor',
        salary: 120000,
        basicSalary: 80000,
        allowances: 20000,
        deductions: 5000,
        netPay: 95000,
        grossPay: 100000,
        bankAccount: '123456789012',
        accountNumber: '9876543210',
        routingNumber: '111000025',
        iban: 'GB29NWBK60161331926819',
        swiftCode: 'NWBKGB2L',
        taxId: 'TX-998877',
        payslip: 'base64payslipdata',
        bonus: 15000,
        hourlyRate: 65,
      };

      const sanitized = redactSensitiveData(payrollData);

      expect(sanitized.employeeName).toBe('Sarah Connor');
      expect(sanitized.salary).toBe('[REDACTED]');
      expect(sanitized.basicSalary).toBe('[REDACTED]');
      expect(sanitized.allowances).toBe('[REDACTED]');
      expect(sanitized.deductions).toBe('[REDACTED]');
      expect(sanitized.netPay).toBe('[REDACTED]');
      expect(sanitized.grossPay).toBe('[REDACTED]');
      expect(sanitized.bankAccount).toBe('[REDACTED]');
      expect(sanitized.accountNumber).toBe('[REDACTED]');
      expect(sanitized.routingNumber).toBe('[REDACTED]');
      expect(sanitized.iban).toBe('[REDACTED]');
      expect(sanitized.swiftCode).toBe('[REDACTED]');
      expect(sanitized.taxId).toBe('[REDACTED]');
      expect(sanitized.payslip).toBe('[REDACTED]');
      expect(sanitized.bonus).toBe('[REDACTED]');
      expect(sanitized.hourlyRate).toBe('[REDACTED]');
    });

    it('redacts personal data and PII', () => {
      const piiData = {
        department: 'Engineering',
        ssn: '000-12-3456',
        socialSecurity: '999-88-7777',
        nationalId: 'ID-456789',
        passport: 'US-A1234567',
        pan: 'ABCDE1234F',
        aadhar: '1234 5678 9012',
        creditCard: '4111-2222-3333-4444',
        cardNumber: '5500-0000-0000-0004',
        cvv: '123',
        dateOfBirth: '1990-05-15',
        dob: '15/05/1990',
        phone: '+1-555-0199',
        phoneNumber: '+91-9876543210',
        address: '123 Cyber Way, Silicon Valley',
      };

      const sanitized = redactSensitiveData(piiData);

      expect(sanitized.department).toBe('Engineering');
      expect(sanitized.ssn).toBe('[REDACTED]');
      expect(sanitized.socialSecurity).toBe('[REDACTED]');
      expect(sanitized.nationalId).toBe('[REDACTED]');
      expect(sanitized.passport).toBe('[REDACTED]');
      expect(sanitized.pan).toBe('[REDACTED]');
      expect(sanitized.aadhar).toBe('[REDACTED]');
      expect(sanitized.creditCard).toBe('[REDACTED]');
      expect(sanitized.cardNumber).toBe('[REDACTED]');
      expect(sanitized.cvv).toBe('[REDACTED]');
      expect(sanitized.dateOfBirth).toBe('[REDACTED]');
      expect(sanitized.dob).toBe('[REDACTED]');
      expect(sanitized.phone).toBe('[REDACTED]');
      expect(sanitized.phoneNumber).toBe('[REDACTED]');
      expect(sanitized.address).toBe('[REDACTED]');
    });

    it('redacts Bearer tokens and JWTs in strings', () => {
      const bearerHeader = 'Bearer secret-access-token-value';
      const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeakThisSignature1234567890';

      expect(redactSensitiveData(bearerHeader)).toBe('Bearer [REDACTED]');
      expect(redactSensitiveData(jwtToken)).toBe('[JWT_REDACTED]');
    });
  });

  describe('Request & Correlation IDs Middleware', () => {
    it('generates new UUIDs when headers are absent', () => {
      const req: any = { headers: {} };
      const res: any = {
        setHeader: vi.fn(),
      };
      const next = vi.fn();

      requestIdMiddleware(req, res, next);

      expect(req.id).toBeDefined();
      expect(req.correlationId).toBeDefined();
      expect(req.id).toBe(req.correlationId);
      expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', req.id);
      expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-Id', req.correlationId);
      expect(next).toHaveBeenCalled();
    });

    it('propagates incoming X-Request-Id and X-Correlation-Id', () => {
      const req: any = {
        headers: {
          'x-request-id': 'req-custom-1234',
          'x-correlation-id': 'corr-custom-5678',
        },
      };
      const res: any = {
        setHeader: vi.fn(),
      };
      const next = vi.fn();

      requestIdMiddleware(req, res, next);

      expect(req.id).toBe('req-custom-1234');
      expect(req.correlationId).toBe('corr-custom-5678');
      expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', 'req-custom-1234');
      expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-Id', 'corr-custom-5678');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Structured Logger & In-Memory Telemetry', () => {
    it('records traffic metrics accurately', () => {
      requestMetrics.record(200, 15);
      requestMetrics.record(201, 25);
      requestMetrics.record(404, 10);
      requestMetrics.record(500, 45);

      expect(requestMetrics.totalRequests).toBeGreaterThanOrEqual(4);
      expect(requestMetrics.status2xx).toBeGreaterThanOrEqual(2);
      expect(requestMetrics.status4xx).toBeGreaterThanOrEqual(1);
      expect(requestMetrics.status5xx).toBeGreaterThanOrEqual(1);
      expect(requestMetrics.avgLatency).toBeGreaterThan(0);
      expect(requestMetrics.p95Latency).toBeGreaterThan(0);
      expect(requestMetrics.availabilityPct).toBeGreaterThan(0);
    });

    it('emits sanitized log entries without throwing', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      expect(() => {
        logger.info('Test operational event', {
          userId: 'user-123',
          companyId: 'company-abc',
          sessionId: 'session-xyz',
          password: 'must-be-redacted',
          salary: 95000,
        }, 'req-test-999');
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });
});

