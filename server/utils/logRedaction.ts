const SENSITIVE_KEYS = [
  'password',
  'passwd',
  'secret',
  'token',
  'authorization',
  'bearer',
  'creditcard',
  'credit_card',
  'cardnumber',
  'ssn',
  'socialsecurity',
  'refresh_token',
  'refreshtoken',
  'access_token',
  'accesstoken',
  'private_key',
  'privatekey',
];

/**
 * Recursively redacts sensitive keys and values from objects, arrays, or strings for safe logging.
 */
export function redactLogData(data: any): any {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    // Redact Bearer tokens or obvious secret patterns in raw string logs
    let redacted = data;
    redacted = redacted.replace(/Bearer\s+[A-Za-z0-9-_=.]+/gi, 'Bearer [REDACTED]');
    redacted = redacted.replace(/("?password"?\s*:\s*")([^"]+)(")/gi, '$1[REDACTED]$3');
    return redacted;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactLogData(item));
  }

  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive));

      if (isSensitive) {
        cleaned[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = redactLogData(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  return data;
}

export default redactLogData;
