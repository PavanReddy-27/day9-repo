import { describe, it, expect, beforeEach } from 'vitest';
import { JobQueue } from '../../server/services/jobQueue';

describe('Job Retry and Dead-Letter Queue Processing', () => {
  let queue: JobQueue;

  beforeEach(() => {
    queue = new JobQueue();
  });

  it('completes job successfully on first attempt', async () => {
    queue.registerHandler('SEND_EMAIL', async (payload) => {
      return `Email sent to ${payload.to}`;
    });

    queue.enqueue('job-1', 'SEND_EMAIL', { to: 'user@example.com' }, 3);
    const result = await queue.processJob('job-1');

    expect(result.status).toBe('completed');
    expect(result.attempts).toBe(1);
    expect(queue.getDeadLetterQueue()).toHaveLength(0);
  });

  it('retries job up to maxRetries on failure', async () => {
    let attempts = 0;
    queue.registerHandler('SYNC_RECORDS', async () => {
      attempts++;
      throw new Error('Sync error');
    });

    queue.enqueue('job-2', 'SYNC_RECORDS', { count: 10 }, 2);

    // Attempt 1
    const res1 = await queue.processJob('job-2');
    expect(res1.status).toBe('pending');
    expect(res1.attempts).toBe(1);

    // Attempt 2 (max retries reached -> moves to dead letter queue)
    const res2 = await queue.processJob('job-2');
    expect(res2.status).toBe('dead_letter');
    expect(res2.attempts).toBe(2);

    const dlq = queue.getDeadLetterQueue();
    expect(dlq).toHaveLength(1);
    expect(dlq[0].id).toBe('job-2');
  });
});
