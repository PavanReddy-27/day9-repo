# Production Security, Sensitive Data Redaction & Data Retention (Task 16 - Ravi Prasad)

## 1. Sensitive Data Redaction Policy

To prevent accidental credential leaks into logs, analytics streams, or monitoring systems, `server/utils/redact.ts` enforces recursive sanitization on all inbound and outbound payloads.

### Scrubbed Key Patterns:
- Passwords (`password`, `currentPassword`, `newPassword`, `confirmPassword`)
- Authentication Tokens (`token`, `accessToken`, `refreshToken`, `tempToken`, `secret`)
- Financial & Identity Data (`creditCard`, `cvv`, `ssn`, `bankAccount`, `accountNumber`)
- Authorization Headers (`authorization`, `bearer`)
- MongoDB URIs with embedded credentials (e.g. `mongodb+srv://user:pass@...`)
- Raw JSON Web Tokens (`eyJhbGciOi...`)

### Example Sanitization Demonstration:
```typescript
// Original Ingress Payload
{
  user: "admin",
  password: "SuperSecretPassword123!",
  nested: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy",
    secret: "my-ultra-secret",
    creditCard: "4111-2222-3333-4444"
  },
  publicInfo: "visible-data"
}

// Sanitized Egress
{
  user: "admin",
  password: "[REDACTED]",
  nested: {
    token: "[REDACTED]",
    secret: "[REDACTED]",
    creditCard: "[REDACTED]"
  },
  publicInfo: "visible-data"
}
```

---

## 2. Configurable Data Retention Rules (`server/services/retentionService.ts`)

To satisfy privacy regulations (GDPR / CCPA / HIPAA), automated data retention policies purge stale operational data while preserving critical business records:

| Data Type | Target Collection | Retention Window | Purge Logic |
|---|---|---|---|
| **Security Audit Logs** | `auditlogs` | **90 Days** (configurable) | `timestamp < (now - 90d)` |
| **Notifications** | `notifications` | **30 Days** (configurable) | `createdAt < (now - 30d)` |
| **Revoked Tokens / Sessions** | `tokenblacklists` | **7 Days** (configurable) | `createdAt < (now - 7d)` |

### 2.1 Dry-Run Safety Mode
Administrators can run retention audits without executing deletes to forecast the impact:
```http
POST /api/v1/system/retention
Content-Type: application/json
Authorization: Bearer <AdminToken>

{
  "policy": { "auditLogDays": 90, "notificationDays": 30, "tokenDays": 7 },
  "dryRun": true
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "dryRun": true,
    "auditLogsEligible": 142,
    "auditLogsPurged": 0,
    "notificationsEligible": 520,
    "notificationsPurged": 0,
    "tokensEligible": 35,
    "tokensPurged": 0
  }
}
```

---

## 3. Cryptographically Verified Audit Log Exports (`exportService.ts`)

When auditors or compliance officers request logs, exports are generated in JSON format with an accompanying SHA-256 integrity hash:
```http
POST /api/v1/system/export
Content-Type: application/json
Authorization: Bearer <AdminToken>

{
  "exportType": "audit_logs",
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-09-15T23:59:59Z"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "exportId": "export-audit_logs-1788251200000.json",
    "sha256": "4b92d6e495f87be2931a7428f52da810b5030e4618e478546de5f973aa68b422",
    "totalRecords": 365,
    "generatedAt": "2026-09-15T05:04:00.000Z",
    "records": [...]
  }
}
```

---

## 4. Multi-Tenant Role-Based Authorization Verification

The application enforces data-level multi-tenancy and hierarchical access controls:
- **Admin**: Full access across tenant metrics, system health, disaster recovery snapshots, user directories.
- **HR**: Organization employee directory, attendance analytics, payroll ledger. No access to system infrastructure metrics.
- **Manager**: Departmental and team-scoped employees, attendance corrections approval. Cross-department queries rejected with `403 Forbidden`.
- **Employee**: Strictly personal attendance history, payroll, and leave requests. Any query attempting to modify another employee's records is rejected with `403 Forbidden` and logged to `complianceviolations`.
- **Test Evidence**: All 26 authorization test cases in `tests/backend/strictDataAuthorization.test.ts` pass with 100% compliance.

