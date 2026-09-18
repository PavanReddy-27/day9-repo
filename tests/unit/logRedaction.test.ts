import { describe, it, expect } from 'vitest';
import { redactLogData } from '../../server/utils/logRedaction';

describe('Log Redaction Utility', () => {
  it('redacts sensitive fields in nested objects', () => {
    const input = {
      username: 'admin',
      password: 'SuperSecretPassword123!',
      meta: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.secret',
        creditCard: '4111-2222-3333-4444',
        ssn: '123-45-6789',
      },
      status: 'active',
    };

    const redacted = redactLogData(input);

    expect(redacted.username).toBe('admin');
    expect(redacted.password).toBe('[REDACTED]');
    expect(redacted.meta.token).toBe('[REDACTED]');
    expect(redacted.meta.creditCard).toBe('[REDACTED]');
    expect(redacted.meta.ssn).toBe('[REDACTED]');
    expect(redacted.status).toBe('active');
  });

  it('redacts Bearer tokens in raw log strings', () => {
    const rawString = 'Failed login attempt with Authorization: Bearer abc123def456ghi789 and "password": "mySecretPassword"';
    const redacted = redactLogData(rawString);

    expect(redacted).not.toContain('abc123def456ghi789');
    expect(redacted).not.toContain('mySecretPassword');
    expect(redacted).toContain('Bearer [REDACTED]');
  });

  it('handles array of objects cleanly', () => {
    const arr = [
      { user: 'alice', secretKey: 'key_123' },
      { user: 'bob', secretKey: 'key_456' },
    ];
    const redacted = redactLogData(arr);

    expect(redacted[0].secretKey).toBe('[REDACTED]');
    expect(redacted[1].secretKey).toBe('[REDACTED]');
    expect(redacted[0].user).toBe('alice');
  });
});
