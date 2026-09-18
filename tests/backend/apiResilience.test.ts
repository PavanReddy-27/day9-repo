import { describe, it, expect } from 'vitest';

/**
 * Simulates a retry wrapper for API client calls with configurable exponential backoff and timeout.
 */
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 50,
  timeoutMs = 1000
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      attempt++;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request Timeout')), timeoutMs)
      );
      return await Promise.race([fn(), timeoutPromise]);
    } catch (err) {
      if (attempt >= retries) {
        throw err;
      }
      await new Promise((res) => setTimeout(res, delayMs * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error('Retries exhausted');
}

describe('Slow and Failed API Requests Resilience', () => {
  it('succeeds on first attempt when API function completes quickly', async () => {
    const mockApi = async () => 'success';
    const result = await fetchWithRetry(mockApi);
    expect(result).toBe('success');
  });

  it('retries upon transient failure and succeeds on subsequent attempt', async () => {
    let callCount = 0;
    const mockApi = async () => {
      callCount++;
      if (callCount < 2) {
        throw new Error('503 Service Unavailable');
      }
      return 'recovered_data';
    };

    const result = await fetchWithRetry(mockApi, 3, 10);
    expect(result).toBe('recovered_data');
    expect(callCount).toBe(2);
  });

  it('fails with timeout error when API operation hangs beyond limit', async () => {
    const slowApi = () => new Promise<string>((res) => setTimeout(() => res('too late'), 300));
    await expect(fetchWithRetry(slowApi, 1, 10, 100)).rejects.toThrow('Request Timeout');
  });

  it('throws error after exhausting max retries on persistent failures', async () => {
    const failingApi = async () => {
      throw new Error('500 Internal Server Error');
    };
    await expect(fetchWithRetry(failingApi, 3, 10)).rejects.toThrow('500 Internal Server Error');
  });
});
