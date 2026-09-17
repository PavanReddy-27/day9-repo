# Workforce Analytics — Backup and Disaster Recovery Runbook (Task 16)

## 1. Objectives & Metrics
- **Recovery Time Objective (RTO)**: `< 15 minutes` — Time required to spin up cold backup assets and restore full database service.
- **Recovery Point Objective (RPO)**: `< 1 hour` — Maximum allowable period of data loss under catastrophic failure, supported by hourly automated snapshots.

---

## 2. Architecture & Checksum Verification
Backups are generated with atomic consistency and include a cryptographically verifiable manifest:
- **Location**: `backups/backup-<YYYY-MM-DD-HHmmss>/`
- **Format**: Structured collection dumps with ISO date and native ObjectId preservation.
- **Integrity**: Every collection JSON file is hashed with **SHA-256** and recorded into `manifest.json`.
- **Pre-flight Check**: The restoration engine verifies that local file hashes match the manifest before modifying the target database.

---

## 3. Operations Runbook

### Taking a Manual Backup
To create an immediate database snapshot via CLI:
```bash
npm run backup:db
# or
npx tsx server/scripts/backup.ts
```
**API Trigger (Admin Only)**:
```http
POST /api/v1/system/backup
Authorization: Bearer <ADMIN_JWT>
```

### Restoring from Backup
To restore from the latest snapshot:
```bash
npm run restore:db
# or
npx tsx server/scripts/restore.ts
```

To restore from a specific snapshot ID:
```bash
npx tsx server/scripts/restore.ts backup-2026-09-15T10-30-00-000Z
```

---

## 4. Disaster Recovery Testing & Verification Procedure
1. Verify existing records and calculate checksum:
   ```bash
   npx tsx server/scripts/benchmarkQueries.ts
   ```
2. Take baseline backup:
   ```bash
   npx tsx server/scripts/backup.ts
   ```
3. Simulate mutation/data loss:
   ```javascript
   // e.g., Drop or modify test collections
   ```
4. Execute restore:
   ```bash
   npx tsx server/scripts/restore.ts
   ```
5. Confirm parity: The restore process automatically validates all checksums and counts against `manifest.json`.

---

## 5. Automated Backup Cron Configuration
In Linux/Docker production environments:
```cron
# Run hourly backup at minute 0
0 * * * * cd /app && npm run backup:db >> /var/log/backup.log 2>&1

# Run daily retention cleanup at 02:00 AM
0 2 * * * cd /app && npx tsx -e "import { RetentionService } from './server/services/retentionService.js'; RetentionService.runRetentionCleanup();"
```

