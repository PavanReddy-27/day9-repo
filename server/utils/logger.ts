import winston from "winston";
import { AsyncLocalStorage } from "async_hooks";

// Async context for request tracing
export const requestContext = new AsyncLocalStorage<Map<string, any>>();

// Sensitive fields that should be redacted from logs
const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "accesstoken",
  "refreshtoken",
  "mfasecret",
  "authorization",
  "cookie",
  // Additional PII and Payroll Redaction
  "salary",
  "ssn",
  "bankaccount",
  "accountnumber",
  "pan",
  "aadhar",
  "personalemail",
  "phonenumber",
]);

// Recursive redaction function
const redact = (obj: any): any => {
  if (obj == null || typeof obj !== "object") return obj;

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(redact);
  }

  // Handle objects
  const redactedObj: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      redactedObj[key] = "[REDACTED]";
    } else if (typeof obj[key] === "object") {
      redactedObj[key] = redact(obj[key]);
    } else {
      redactedObj[key] = obj[key];
    }
  }
  return redactedObj;
};

// Custom Winston formatter to inject async context and redact fields
const customFormat = winston.format.printf((info) => {
  const store = requestContext.getStore();
  const reqId = store?.get("requestId");
  const userId = store?.get("userId");
  const sessionId = store?.get("sessionId");
  const orgId = store?.get("orgId");

  const baseInfo = {
    ...info,
    reqId,
    userId,
    sessionId,
    orgId,
  };

  const redactedInfo = redact(baseInfo);
  return JSON.stringify(redactedInfo);
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    customFormat
  ),
  transports: [
    new winston.transports.Console()
  ],
});

export const requestMetrics = {
  totalRequests: 0,
  status2xx: 0,
  status4xx: 0,
  status5xx: 0,
  latencies: [] as number[],
  get p95Latency(): number {
    if (this.latencies.length === 0) return 0;
    const sorted = [...this.latencies].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return Math.round(sorted[index] ?? 0);
  },
  get avgLatency(): number {
    if (this.latencies.length === 0) return 0;
    const sum = this.latencies.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.latencies.length);
  },
  get availabilityPct(): number {
    if (this.totalRequests === 0) return 100;
    const successful = this.status2xx + this.status4xx;
    return parseFloat(((successful / this.totalRequests) * 100).toFixed(2));
  },
  record(status: number, durationMs: number): void {
    this.totalRequests++;
    if (status >= 500) this.status5xx++;
    else if (status >= 400) this.status4xx++;
    else if (status >= 200) this.status2xx++;

    this.latencies.push(durationMs);
    if (this.latencies.length > 500) {
      this.latencies.shift();
    }
  }
};
