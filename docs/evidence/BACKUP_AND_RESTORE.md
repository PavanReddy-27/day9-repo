# Disaster Recovery & Database Backup and Restore Verification (Task 16 - Sridhika)

## 1. Disaster Recovery Specifications
- **Recovery Point Objective (RPO)**: $\le 1$ hour. Periodic snapshot frequency and append-only audit logging.
- **Recovery Time Objective (RTO)**: $\le 15$ minutes for automated restoration and validation.
- **Data Integrity Guarantee**: 100% cryptographic SHA-256 manifest verification across all collections before restoration commitment.

---

## 2. Backup Procedure Execution (`npm run backup:db`)

The automated backup utility (`server/scripts/backup.ts`) scans the target database, serializes collections with type preservation (ObjectIds, Dates), computes individual SHA-256 hashes, and emits a structured `manifest.json`.

### Live Snapshot Output Evidence:
```
====================================================
[Disaster Recovery] Initiating MongoDB Backup...
====================================================
✓ Backed up collection: payrollrecords        (525 docs, 265 KB)
✓ Backed up collection: locations             (20 docs, 8 KB)
✓ Backed up collection: employees             (340 docs, 277 KB)
✓ Backed up collection: payrollperiods        (26 docs, 9 KB)
✓ Backed up collection: employeeskills        (500 docs, 164 KB)
✓ Backed up collection: performancerecords    (1000 docs, 431 KB)
✓ Backed up collection: rosters               (250 docs, 98 KB)
✓ Backed up collection: notifications         (1107 docs, 433 KB)
✓ Backed up collection: teams                 (115 docs, 31 KB)
✓ Backed up collection: weeklyoffs            (250 docs, 64 KB)
✓ Backed up collection: productivityrecords   (5500 docs, 1981 KB)
✓ Backed up collection: auditlogs             (365 docs, 202 KB)
✓ Backed up collection: users                 (371 docs, 166 KB)
✓ Backed up collection: attendancerecords     (5515 docs, 4731 KB)
✓ Backed up collection: companies             (34 docs, 7 KB)
✓ Backed up collection: complianceviolations  (96 docs, 52 KB)
✓ Backed up collection: departments           (67 docs, 20 KB)
... [42 total collections]
====================================================
[Disaster Recovery] Backup backup-2026-09-15T05-02-23-336Z completed!
Total Collections: 42 | Total Documents: 16464 | Size: 9100 KB
Manifest Path: backups/backup-2026-09-15T05-02-23-336Z/manifest.json
====================================================
```

---

## 3. Cryptographic Manifest Sample (`manifest.json`)

```json
{
  "backupId": "backup-2026-09-15T05-02-23-336Z",
  "createdAt": "2026-09-15T05:02:28.574Z",
  "database": "workforce",
  "host": "127.0.0.1",
  "totalCollections": 42,
  "totalDocuments": 16464,
  "totalSizeBytes": 9318030,
  "collections": [
    {
      "name": "payrollrecords",
      "count": 525,
      "sizeBytes": 271495,
      "sha256": "d6e98b052b7c98f6df9ca132ff5a0b2d01f3c110dded6f230da089a8e2350109"
    },
    {
      "name": "employees",
      "count": 340,
      "sizeBytes": 283674,
      "sha256": "687ef12d97d2708d3a51c40ad45b097631123e0d82ad669f2d5f13600956a506"
    },
    {
      "name": "attendancerecords",
      "count": 5515,
      "sizeBytes": 4845018,
      "sha256": "7247c7e1e772440ba4e43cb82960f2b5abaa4bd348aea6ef3895853366fd4477"
    }
  ]
}
```

---

## 4. Restoration Procedure & Verification (`npm run restore:db`)

Restoration (`server/scripts/restore.ts`) follows an atomic 3-step sequence:
1. **Pre-flight Integrity Verification**: Recalculates SHA-256 for all `.json` files in the snapshot directory and compares against `manifest.json`. If a single byte differs, restoration immediately aborts without touching the database.
2. **Type Revival**: Reconstructs native BSON `ObjectId` and `Date` instances from JSON representations.
3. **Atomic Replacement & Post-Count Validation**: Restores collections and asserts that the count of imported records matches `manifest.json` exactly.

### Test Automation Verification (`tests/backend/backupRestore.test.ts`):
- Snapshot creation: **PASSED**
- Checksum assertion: **PASSED**
- Complete document fidelity roundtrip: **PASSED**

