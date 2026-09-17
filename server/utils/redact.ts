/**
 * Sensitive Data Redaction Utility
 * Recursively scrubs credentials, secrets, tokens, and PII from objects, logs, and payloads.
 */

const SENSITIVE_KEYS = new Set([
  // Passwords & Secrets
  'password',
  'passwd',
  'passwordhash',
  'oldpassword',
  'newpassword',
  'secret',
  'privatekey',
  'apikey',

  // Tokens & Auth Headers
  'token',
  'accesstoken',
  'refreshtoken',
  'temptoken',
  'mfasecret',
  'mfatoken',
  'authorization',
  'cookie',
  'setcookie',

  // Payroll Data
  'salary',
  'basicsalary',
  'allowances',
  'deductions',
  'netpay',
  'grosspay',
  'bankaccount',
  'accountnumber',
  'routingnumber',
  'iban',
  'swiftcode',
  'taxid',
  'payslip',
  'bonus',
  'hourlyrate',

  // Personal Data & PII
  'creditcard',
  'cardnumber',
  'cvv',
  'ssn',
  'bankaccount',
  'routingnumber',
  'accountnumber',
  'salary',
  'pan',
  'aadhar',
  'personalemail',
  'phonenumber',
  'apikey',
  'privatekey',
  'socialsecurity',
  'nationalid',
  'passport',
  'pan',
  'aadhar',
  'dateofbirth',
  'dob',
  'phone',
  'phonenumber',
  'address',
]);

export const redactSensitiveData = <T = any>(input: T, depth = 0): T => {
  if (depth > 10) return '[MAX_DEPTH]' as any;
  if (input === null || input === undefined) return input;

  if (typeof input === 'string') {
    // Redact Bearer tokens in headers
    if (input.toLowerCase().startsWith('bearer ')) {
      return 'Bearer [REDACTED]' as any;
    }
    // Redact JWT strings
    if (/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(input) && input.length > 30) {
      return '[JWT_REDACTED]' as any;
    }
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => redactSensitiveData(item, depth + 1)) as any;
  }

  if (typeof input === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
      if (SENSITIVE_KEYS.has(lowerKey)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = redactSensitiveData(value, depth + 1);
      } else if (typeof value === 'string') {
        sanitized[key] = redactSensitiveData(value, depth + 1);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized as T;
  }

  return input;
};

export default redactSensitiveData;

