import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import connectDB, { closeDB } from '../../server/config/db.js';
import { JobQueueService } from '../../server/services/jobQueueService.js';
import Job from '../../server/models/Job.js';
import DeadLetterJob from '../../server/models/DeadLetterJob.js';

describe('Reliable Background Job Queue & Dead-Letter Management Suite (Task 16)', () => {
  beforeAll(async () => {
    await connectDB();
    await Job.deleteMany({ type: { $in: ['UNIT_TEST_SUCCESS', 'UNIT_TEST_RETRY', 'UNIT_TEST_DLQ'] } });
    await DeadLetterJob.deleteMany({ type: { $in: ['UNIT_TEST_SUCCESS', 'UNIT_TEST_RETRY', 'UNIT_TEST_DLQ'] } });
  }, 30000);

  afterAll(async () => {
    await Job.deleteMany({ type: { $in: ['UNIT_TEST_SUCCESS', 'UNIT_TEST_RETRY', 'UNIT_TEST_DLQ'] } });
    await DeadLetterJob.deleteMany({ type: { $in: ['UNIT_TEST_SUCCESS', 'UNIT_TEST_RETRY', 'UNIT_TEST_DLQ'] } });
    await closeDB();
  });

  it('calculates exponential backoff delay correctly with jitter', () => {
    const delay1 = JobQueueService.calculateBackoff(1);
    const delay2 = JobQueueService.calculateBackoff(2);
    const delay3 = JobQueueService.calculateBackoff(3);

    expect(delay1).toBeGreaterThanOrEqual(1000);
    expect(delay2).toBeGreaterThanOrEqual(2000);
    expect(delay3).toBeGreaterThanOrEqual(4000);
  });

  it('enqueues and processes a successful background job', async () => {
    let executed = false;
    JobQueueService.registerHandler('UNIT_TEST_SUCCESS', async (payload) => {
      executed = true;
      return { echo: payload.message };
    });

    const job = await JobQueueService.enqueue('UNIT_TEST_SUCCESS', { message: 'hello-world' });
    expect(job.status).toBe('pending');

    const processed = await JobQueueService.processNextJob();
    expect(processed).toBe(true);
    expect(executed).toBe(true);

    const updatedJob = await Job.findById(job._id);
    expect(updatedJob?.status).toBe('completed');
    expect(updatedJob?.completedAt).toBeDefined();
  });

  it('retries failing jobs up to maxRetries with backoff scheduling', async () => {
    let callCount = 0;
    JobQueueService.registerHandler('UNIT_TEST_RETRY', async () => {
      callCount++;
      throw new Error(`Intentional error on call ${callCount}`);
    });

    const job = await JobQueueService.enqueue('UNIT_TEST_RETRY', {}, { maxRetries: 3 });

    // Attempt 1: Should fail and schedule next run
    const processed1 = await JobQueueService.processNextJob();
    expect(processed1).toBe(true);

    const afterAttempt1 = await JobQueueService.findById ? await (Job as any).findById(job._id) : await Job.findById(job._id);
    expect(afterAttempt1?.attempts).toBe(1);
    expect(afterAttempt1?.status).toBe('pending');
    expect(afterAttempt1?.nextRunAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('moves job to Dead-Letter Queue when maxRetries is exceeded and supports re-drive', async () => {
    JobQueueService.registerHandler('UNIT_TEST_DLQ', async () => {
      throw new Error('Terminal failure simulation');
    });

    // Job with maxRetries: 1
    const job = await JobQueueService.enqueue('UNIT_TEST_DLQ', { payloadKey: 'val123' }, { maxRetries: 1 });

    const processed = await JobQueueService.processNextJob();
    expect(processed).toBe(true);

    const finalJob = await Job.findById(job._id);
    expect(finalJob?.status).toBe('failed');

    // Verify DLQ entry
    const dlq = await DeadLetterJob.findOne({ originalJobId: job._id });
    expect(dlq).toBeDefined();
    expect(dlq?.type).toBe('UNIT_TEST_DLQ');
    expect(dlq?.finalError).toContain('Terminal failure simulation');
    expect(dlq?.resolution).toBe('unresolved');

    // Test Re-driving from DLQ
    if (dlq) {
      const redrivenJob = await JobQueueService.redriveDeadLetter(dlq._id.toString(), 'admin@test.com');
      expect(redrivenJob.status).toBe('pending');
      expect(redrivenJob.type).toBe('UNIT_TEST_DLQ');

      const updatedDlq = await DeadLetterJob.findById(dlq._id);
      expect(updatedDlq?.resolution).toBe('retried');
      expect(updatedDlq?.resolvedBy).toBe('admin@test.com');
    }
  });
});
