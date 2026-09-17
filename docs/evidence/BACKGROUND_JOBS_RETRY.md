# Reliable Background Jobs, Exponential Backoff & Dead-Letter Queue (Task 16 - Rupesh)

## 1. Architecture Overview
Workforce Analytics utilizes an asynchronous background job processing system designed for guaranteed at-least-once delivery with exponential backoff retries and isolation of permanently failed tasks into a Dead-Letter Queue (DLQ).

```
[Job Dispatcher] ──> [jobs Collection (status: pending)]
                            │
                            ▼
                     [Worker Execution]
                     ┌──────┴────────┐
                     ▼               ▼
                 [Success]       [Failure]
                     │               │
                     │       attempts < maxRetries?
                     │       ┌───────┴───────┐
                     │      YES              NO
                     │       │               │
                     │  [Backoff Delay]      ▼
                     │       │         [Route to DLQ]
                     │       ▼               │
                     │   (nextRunAt)   [deadletterjobs]
                     │                       │
                     ▼                       ▼
            [status: completed]     [Admin Manual Re-Drive]
```

---

## 2. Exponential Backoff Policy & Jitter Formula

When a job handler throws an error, the queue calculates the retry delay using an exponential power formula combined with full randomization jitter to prevent thundering-herd issues on downstream resources:

$$\text{Delay} = \min(\text{maxDelayMs}, \text{baseDelayMs} \times 2^{\text{attempt}} + \text{random}(0, \text{jitterMs}))$$

### Backoff Progression Table:
| Attempt # | Base Delay | Multiplier | Jitter Range | Scheduled Delay Window |
|---|---|---|---|---|
| **1** | 1,000 ms | $2^1 = 2$ | 0 – 500 ms | **2,000 – 2,500 ms** |
| **2** | 1,000 ms | $2^2 = 4$ | 0 – 500 ms | **4,000 – 4,500 ms** |
| **3** | 1,000 ms | $2^3 = 8$ | 0 – 500 ms | **8,000 – 8,500 ms** |
| **4** | 1,000 ms | $2^4 = 16$ | 0 – 500 ms | **16,000 – 16,500 ms** |
| **5 (Max)** | 1,000 ms | $2^5 = 32$ | 0 – 500 ms | **Route to Dead-Letter Queue** |

---

## 3. Dead-Letter Queue (DLQ) Implementation

Permanent failures are captured in the `deadletterjobs` collection with complete forensic diagnostic metadata:
- `originalJobId`: ID of the parent failed job
- `type`: Job category (e.g., `PAYROLL_RUN`, `COMPLIANCE_SCAN`, `AUDIT_PURGE`)
- `payload`: Exact serialized input payload
- `attempts`: Total count of failed execution attempts
- `finalError`: Detailed error message and stack trace
- `failedAt`: Timestamp of final ejection
- `resolution`: `unresolved` | `retried` | `discarded`

### 3.1 DLQ Administrative Operations

1. **List DLQ Items**:
   ```http
   GET /api/v1/jobs/dead-letter
   Authorization: Bearer <AdminToken>
   ```
2. **Re-Drive (Retry) DLQ Item**:
   ```http
   POST /api/v1/jobs/dead-letter/:id/retry
   Authorization: Bearer <AdminToken>
   ```
   *Action*: Resets attempt counter, marks DLQ item as `retried`, and enqueues a fresh high-priority job.
3. **Discard DLQ Item**:
   ```http
   DELETE /api/v1/jobs/dead-letter/:id
   Authorization: Bearer <AdminToken>
   ```

---

## 4. Test Verification Suite (`tests/backend/jobQueue.test.ts`)

- **Exponential Backoff Calculation**: Verified retry timestamps advance by exponential delay.
- **DLQ Routing**: Verified that jobs reaching `maxRetries` (3/3) are purged from active jobs and archived in `deadletterjobs`.
- **Admin DLQ Re-Drive**: Verified re-drive action creates a new active job and flags DLQ item as resolved.

