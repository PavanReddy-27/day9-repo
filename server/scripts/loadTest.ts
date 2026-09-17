/**
 * Automated Production Load Test Script (Task 16 - Anvesh)
 * Executes concurrent stress testing against system endpoints,
 * measuring throughput (req/s), latency distributions, and error rates.
 */
import 'dotenv/config';

interface LoadTestOptions {
  baseUrl?: string;
  totalRequests?: number;
  concurrency?: number;
  endpoint?: string;
}

interface LoadTestStats {
  endpoint: string;
  totalRequests: number;
  concurrency: number;
  successful: number;
  failed: number;
  durationMs: number;
  requestsPerSecond: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
}

export async function runLoadTest(options: LoadTestOptions = {}): Promise<LoadTestStats> {
  const baseUrl = options.baseUrl || 'http://localhost:5000';
  const endpoint = options.endpoint || '/health';
  const totalRequests = options.totalRequests || 50;
  const concurrency = options.concurrency || 10;
  const targetUrl = `${baseUrl}${endpoint}`;

  console.log('====================================================');
  console.log(`[Load Test] Target: ${targetUrl}`);
  console.log(`[Load Test] Requests: ${totalRequests} | Concurrency: ${concurrency}`);
  console.log('====================================================');

  const latencies: number[] = [];
  let successful = 0;
  let failed = 0;
  let completed = 0;

  const startTotal = Date.now();

  async function worker() {
    while (completed < totalRequests) {
      completed++;
      const reqStart = Date.now();
      try {
        const res = await fetch(targetUrl, { headers: { 'X-Request-Id': `loadtest-${Date.now()}-${completed}` } });
        const latency = Date.now() - reqStart;
        latencies.push(latency);
        if (res.ok) {
          successful++;
        } else {
          failed++;
        }
      } catch {
        const latency = Date.now() - reqStart;
        latencies.push(latency);
        failed++;
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  const durationMs = Date.now() - startTotal;
  const requestsPerSecond = Math.round((totalRequests / (durationMs / 1000)) * 10) / 10;

  latencies.sort((a, b) => a - b);
  const minLatencyMs = latencies[0] || 0;
  const maxLatencyMs = latencies[latencies.length - 1] || 0;
  const avgLatencyMs = Math.round(latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1));
  const p95Index = Math.floor(latencies.length * 0.95);
  const p95LatencyMs = latencies[p95Index] || 0;

  const stats: LoadTestStats = {
    endpoint,
    totalRequests,
    concurrency,
    successful,
    failed,
    durationMs,
    requestsPerSecond,
    minLatencyMs,
    maxLatencyMs,
    avgLatencyMs,
    p95LatencyMs,
  };

  console.log('\n--- LOAD TEST RESULTS ---');
  console.log(`Endpoint:           ${endpoint}`);
  console.log(`Total Requests:     ${totalRequests}`);
  console.log(`Success / Failure:  ${successful} / ${failed}`);
  console.log(`Throughput:         ${requestsPerSecond} req/sec`);
  console.log(`Avg Latency:        ${avgLatencyMs} ms`);
  console.log(`p95 Latency:        ${p95LatencyMs} ms`);
  console.log(`Min / Max Latency:  ${minLatencyMs} ms / ${maxLatencyMs} ms`);
  console.log('-------------------------\n');

  return stats;
}

if (process.argv[1]?.includes('loadTest')) {
  runLoadTest().catch(console.error);
}

export default runLoadTest;

