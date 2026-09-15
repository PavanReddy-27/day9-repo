# Production Health Probes, Observability & Telemetry (Task 16 - Suman)

## 1. Kubernetes & Container Orchestration Probes

The application provides native lightweight probes adhering to standard container orchestration specifications (Kubernetes, AWS ECS, GCP Cloud Run, Docker Swarm):

### 1.1 Liveness Probe (`GET /health`)
- **Purpose**: Fast check verifying the Node.js event loop and memory limits are intact.
- **Port**: 5000
- **Status Code**: `200 OK`
- **Sample Response**:
```json
{
  "status": "healthy",
  "uptimeSeconds": 142.6,
  "timestamp": "2026-09-15T05:03:10.120Z",
  "memory": {
    "heapUsedMB": 82.14,
    "heapTotalMB": 128.50,
    "rssMB": 164.20,
    "externalMB": 14.88
  }
}
```

### 1.2 Readiness Probe (`GET /ready`)
- **Purpose**: Verifies upstream downstream database connectivity before receiving ingress traffic.
- **Status Code**: `200 OK` (connected) or `503 Service Unavailable` (offline/reconnecting).
- **Sample Response**:
```json
{
  "status": "ready",
  "database": {
    "status": "connected",
    "host": "127.0.0.1",
    "name": "workforce_analytics",
    "pingMs": 1.2
  },
  "timestamp": "2026-09-15T05:03:10.250Z"
}
```

### 1.3 Version & Release Metadata (`GET /version`)
- **Purpose**: Automated CI/CD pipeline verification of active commit SHA and runtime platform.
- **Status Code**: `200 OK`
- **Sample Response**:
```json
{
  "name": "workforce-analytics",
  "version": "1.0.0",
  "environment": "production",
  "gitCommit": "production-release-task16",
  "nodeVersion": "v20.18.0",
  "platform": "win32-x64",
  "timestamp": "2026-09-15T05:03:10.300Z"
}
```

---

## 2. Request Correlation & Distributed Tracing (`X-Request-Id`)

Every request traversing the API gateway is automatically assigned a unique UUIDv4 identifier via `server/middleware/requestId.ts`.

- If a client supplies an existing `X-Request-Id` in the headers, it is validated and propagated downstream.
- If missing, a new RFC-4122 UUID is generated.
- The ID is attached to Express `req.id`, injected into `res.setHeader('X-Request-Id', ...)`, and appended to all structured JSON logs.

```bash
# Example verification
curl -i http://localhost:5000/health
HTTP/1.1 200 OK
X-Request-Id: 29d452e9-b700-427a-a0e2-966bc8d6b897
Content-Type: application/json; charset=utf-8
```

---

## 3. Structured JSON Logging

All logs are written as structured JSON to standard output (`stdout` / `stderr`) via `server/utils/logger.ts`, facilitating seamless aggregation in Datadog, Grafana Loki, AWS CloudWatch, or Google Cloud Logging:

```json
{
  "timestamp": "2026-09-15T05:02:28.575Z",
  "level": "info",
  "service": "workforce-analytics-api",
  "message": "GET /api/v1/system/metrics 200 in 5ms",
  "requestId": "b31e5659-22e8-44f7-9b46-7529027d9308",
  "context": {
    "method": "GET",
    "url": "/api/v1/system/metrics",
    "status": 200,
    "durationMs": 5,
    "ip": "127.0.0.1"
  }
}
```

---

## 4. Admin Real-Time Metrics (`GET /api/v1/system/metrics`)

Requires authenticated `Admin` bearer token:
- **Server Telemetry**: Node uptime, CPU core counts, platform, Node version.
- **Memory Consumption**: Heap used, heap total, resident set size (RSS), utilization %.
- **MongoDB Telemetry**: Database connection state, ping roundtrip latency, active collections count.
- **API Traffic Profile**: Total requests serviced, HTTP status code distribution (2xx, 4xx, 5xx), and rolling p95 latency.

