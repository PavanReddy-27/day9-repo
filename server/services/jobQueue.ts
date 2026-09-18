export interface Job<T = any> {
  id: string;
  type: string;
  payload: T;
  attempts: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'dead_letter';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class JobQueue {
  private jobs: Map<string, Job> = new Map();
  private deadLetterQueue: Job[] = [];
  private handlers: Map<string, (payload: any) => Promise<any>> = new Map();

  registerHandler(type: string, handler: (payload: any) => Promise<any>) {
    this.handlers.set(type, handler);
  }

  enqueue<T>(id: string, type: string, payload: T, maxRetries = 3): Job<T> {
    const job: Job<T> = {
      id,
      type,
      payload,
      attempts: 0,
      maxRetries,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.jobs.set(id, job);
    return job;
  }

  async processJob(id: string): Promise<Job> {
    const job = this.jobs.get(id);
    if (!job) {
      throw new Error(`Job ${id} not found`);
    }

    const handler = this.handlers.get(job.type);
    if (!handler) {
      job.status = 'failed';
      job.error = `No handler registered for type ${job.type}`;
      job.updatedAt = new Date();
      return job;
    }

    job.attempts += 1;
    job.status = 'processing';
    job.updatedAt = new Date();

    try {
      await handler(job.payload);
      job.status = 'completed';
      job.updatedAt = new Date();
    } catch (err: any) {
      job.error = err?.message || String(err);
      job.updatedAt = new Date();

      if (job.attempts < job.maxRetries) {
        job.status = 'pending';
      } else {
        job.status = 'dead_letter';
        this.deadLetterQueue.push(job);
      }
    }

    return job;
  }

  getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  getDeadLetterQueue(): Job[] {
    return [...this.deadLetterQueue];
  }

  clear(): void {
    this.jobs.clear();
    this.deadLetterQueue = [];
  }
}

export const defaultJobQueue = new JobQueue();
export default defaultJobQueue;
