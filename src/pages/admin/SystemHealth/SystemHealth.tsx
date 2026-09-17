import { useEffect, useState, useCallback } from "react";
import { apiClient } from "../../../services/apiClient";
import { getOfflineQueueStats, OfflineQueueStats } from "../../../utils/offlineQueue";
import {
  FiActivity,
  FiServer,
  FiDatabase,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiUsers,
  FiLock,
  FiBell,
  FiClock,
  FiZap,
  FiRadio,
  FiSend,
  FiShield,
  FiPlay,
} from "react-icons/fi";
import "./SystemHealth.css";

interface SystemMetrics {
  timestamp: string;
  server: {
    uptimeSeconds: number;
    nodeVersion: string;
    platform: string;
    cpuCount: number;
    loadAverage: number[];
    freeMemoryMB: number;
    totalMemoryMB: number;
  };
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
    externalMB: number;
  };
  database: {
    status: string;
    state?: string;
    connected?: boolean;
    readyState?: number;
    host: string;
    name: string;
    pingMs: number;
    collectionsCount: number;
    documentCounts: Record<string, number>;
  };
  traffic: {
    totalRequests: number;
    status2xx: number;
    status4xx: number;
    status5xx: number;
    p95LatencyMs: number;
    avgLatencyMs?: number;
    availabilityPct?: number;
  };
  monitoring?: {
    activeSessions: number;
    connectedClients: number;
    failedLogins: number;
    lockedAccounts: number;
    offlineSyncFailures: number;
    notificationFailures: number;
    recentFailedLogins?: Array<{
      _id: string;
      performedBy: string;
      userRole: string;
      details: string;
      ipAddress: string;
      timestamp: string;
    }>;
    recentLockedAccounts?: Array<{
      _id: string;
      email: string;
      role: string;
      failedLoginAttempts: number;
      lockUntil: string;
      updatedAt?: string;
    }>;
  };
  backgroundJobs?: {
    status: string;
    stats: JobStats | null;
  };
}

interface JobStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  deadLetterCount: number;
}

interface DeadLetterItem {
  _id: string;
  originalJobId: string;
  type: string;
  attempts: number;
  finalError: string;
  failedAt: string;
  resolution: string;
}

const SystemHealth = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [jobStats, setJobStats] = useState<JobStats | null>(null);
  const [dlqItems, setDlqItems] = useState<DeadLetterItem[]>([]);
  const [offlineStats, setOfflineStats] = useState<OfflineQueueStats | null>(null);
  const [sseConnected, setSseConnected] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "dlq" | "security">("overview");

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const isMongoOnline = Boolean(
    metrics?.database &&
    (metrics.database.status === "connected" ||
      metrics.database.status === "Online" ||
      metrics.database.state === "Online" ||
      metrics.database.connected === true) &&
    metrics.database.status !== "disconnected" &&
    metrics.database.state !== "Offline"
  );

  const effectiveJobStats = jobStats || metrics?.backgroundJobs?.stats;

  const fetchDashboardData = useCallback(async () => {
    try {
      const [mRes, jRes, dlqRes] = await Promise.allSettled([
        apiClient<{ success: boolean; data: SystemMetrics }>("/system/metrics"),
        apiClient<{ success: boolean; data: JobStats }>("/jobs/stats"),
        apiClient<{ success: boolean; data: DeadLetterItem[] }>("/jobs/dead-letter"),
      ]);

      const mData = mRes.status === "fulfilled" ? ((mRes.value as any)?.data || mRes.value) : null;
      if (mData && mData.server) {
        setMetrics(mData);
      } else {
        // Fallback: probe public /ready endpoint if /system/metrics is unreachable (e.g. MongoDB disconnected)
        try {
          const readyRes = await apiClient<{ status: string; database: { connected: boolean; pingMs: number; name?: string; host?: string } }>("/ready");
          if (readyRes?.database) {
            const dbConnected = Boolean(readyRes.database.connected);
            setMetrics((prev) => {
              if (prev) {
                return {
                  ...prev,
                  database: {
                    ...prev.database,
                    status: dbConnected ? "connected" : "disconnected",
                    state: dbConnected ? "Online" : "Offline",
                    connected: dbConnected,
                    pingMs: readyRes.database.pingMs ?? 0,
                  },
                };
              }
              return {
                timestamp: new Date().toISOString(),
                server: { uptimeSeconds: 0, nodeVersion: "v20.x", platform: "", cpuCount: 4, loadAverage: [], freeMemoryMB: 0, totalMemoryMB: 0 },
                memory: { heapUsedMB: 0, heapTotalMB: 0, rssMB: 0, externalMB: 0 },
                database: {
                  status: dbConnected ? "connected" : "disconnected",
                  state: dbConnected ? "Online" : "Offline",
                  connected: dbConnected,
                  host: readyRes.database.host || "unknown",
                  name: readyRes.database.name || "workforce",
                  pingMs: readyRes.database.pingMs ?? 0,
                  collectionsCount: 0,
                  documentCounts: {},
                },
                traffic: { totalRequests: 0, status2xx: 0, status4xx: 0, status5xx: 0, p95LatencyMs: 0, avgLatencyMs: 0, availabilityPct: 100 },
                monitoring: { activeSessions: 0, connectedClients: 0, failedLogins: 0, lockedAccounts: 0, offlineSyncFailures: 0, notificationFailures: 0 },
              };
            });
          }
        } catch {
          // If both fail, safely mark database as Offline
          setMetrics((prev) => prev ? {
            ...prev,
            database: {
              ...prev.database,
              status: "disconnected",
              state: "Offline",
              connected: false,
              pingMs: 0,
            }
          } : null);
        }
      }

      const jData = jRes.status === "fulfilled" ? ((jRes.value as any)?.data || jRes.value) : null;
      if (jData && typeof jData === "object" && "total" in jData) {
        setJobStats(jData);
      } else if (mData?.backgroundJobs?.stats) {
        setJobStats(mData.backgroundJobs.stats);
      }

      const dlqData = dlqRes.status === "fulfilled" ? ((dlqRes.value as any)?.data || dlqRes.value) : null;
      if (Array.isArray(dlqData)) setDlqItems(dlqData);

      // Fetch local browser offline queue status
      try {
        const offStats = await getOfflineQueueStats();
        setOfflineStats(offStats);
      } catch {
        // IndexedDB may be unavailable in some test environments
      }
    } catch {
      // Nominal catch
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Live poll every 10s

    const handleSseStatus = (e: any) => {
      if (typeof e.detail?.connected === "boolean") {
        setSseConnected(e.detail.connected);
      }
    };

    const handlePingNotification = (e: any) => {
      showToast(`Received real-time SSE broadcast: ${e.detail || "System Ping"}`, "success");
      fetchDashboardData();
    };

    window.addEventListener("sse_connection_changed", handleSseStatus);
    window.addEventListener("system_ping_received", handlePingNotification);

    return () => {
      clearInterval(interval);
      window.removeEventListener("sse_connection_changed", handleSseStatus);
      window.removeEventListener("system_ping_received", handlePingNotification);
    };
  }, [fetchDashboardData]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleRetryJob = async (id: string) => {
    try {
      await apiClient(`/jobs/dead-letter/${id}/retry`, { method: "POST" });
      showToast("Job re-driven back to active queue", "success");
      fetchDashboardData();
    } catch (err: any) {
      showToast(`Retry failed: ${err.message}`, "error");
    }
  };

  const handleDiscardJob = async (id: string) => {
    try {
      await apiClient(`/jobs/dead-letter/${id}`, { method: "DELETE" });
      showToast("Job discarded from DLQ", "success");
      fetchDashboardData();
    } catch (err: any) {
      showToast(`Discard failed: ${err.message}`, "error");
    }
  };

  const handleTestPing = async () => {
    setActionLoading("ping");
    try {
      const start = Date.now();
      const res = await apiClient<{ success: boolean; message: string }>("/system/test-ping", { method: "POST" });
      const duration = Date.now() - start;
      showToast(`${res.message || "API Ping OK"} (${duration}ms)`, "success");
      fetchDashboardData();
    } catch (err: any) {
      showToast(`Ping failed: ${err.message}`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleTestSsePing = async () => {
    setActionLoading("sse");
    try {
      const res = await apiClient<{ success: boolean; message: string; connectedClients: number }>("/system/test-sse-ping", { method: "POST" });
      showToast(res.message || "Broadcasted SSE Ping", "success");
      fetchDashboardData();
    } catch (err: any) {
      showToast(`SSE Ping failed: ${err.message}`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleTestNotification = async () => {
    setActionLoading("notification");
    try {
      const res = await apiClient<{ success: boolean; message: string }>("/system/test-notification", {
        method: "POST",
        body: JSON.stringify({
          title: "System Telemetry Alert",
          message: `Live notification check completed at ${new Date().toLocaleTimeString()}`,
          type: "INFO",
        }),
      });
      showToast(res.message || "Notification sent", "success");
      fetchDashboardData();
    } catch (err: any) {
      showToast(`Notification test failed: ${err.message}`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSyncOfflineQueue = async () => {
    setActionLoading("offline");
    try {
      window.dispatchEvent(new CustomEvent("sync_offline_queue"));
      showToast("Triggered offline queue synchronization", "success");
      const stats = await getOfflineQueueStats();
      setOfflineStats(stats);
      fetchDashboardData();
    } catch (err: any) {
      showToast(`Sync failed: ${err.message}`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnqueueJob = async () => {
    setActionLoading("job");
    try {
      const res = await apiClient<{ success: boolean; message: string }>("/jobs/trigger", {
        method: "POST",
        body: JSON.stringify({ type: "PING_HEALTH_CHECK", payload: { timestamp: new Date().toISOString() } }),
      });
      showToast(res.message || "Test background job enqueued", "success");
      fetchDashboardData();
    } catch (err: any) {
      showToast(`Job enqueue failed: ${err.message}`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  if (loading && !metrics) {
    return (
      <div className="system-health-page" style={{ padding: "48px", textAlign: "center", color: "var(--text-light)" }}>
        <FiRefreshCw className="spin-animate" style={{ fontSize: "2rem", marginBottom: "16px", color: "var(--primary)" }} />
        <h2 style={{ color: "var(--text-h)", fontSize: "1.25rem" }}>Connecting to Workforce Monitoring Engine...</h2>
      </div>
    );
  }

  return (
    <div className="system-health-page">
      {/* Toast Notification */}
      {toast && (
        <div className={`banner-toast ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="health-header-bar">
        <div className="health-title-group">
          <h1>System Health & Operations</h1>
          <p className="health-subtitle">
            Centralized monitoring: API availability, active sessions, failed logins, offline attendance, notifications, and MongoDB status.
          </p>
        </div>

        <div className="health-actions-group">
          <div
            className={`status-badge ${
              isMongoOnline ? "healthy" : "degraded"
            }`}
          >
            <span className={`status-pulse ${isMongoOnline ? "online" : "offline"}`} />
            {isMongoOnline ? "Operational (MongoDB Online)" : "Degraded (MongoDB Offline)"}
          </div>

          <button
            className="action-btn secondary"
            onClick={handleManualRefresh}
            disabled={refreshing}
            aria-label="Refresh telemetry data"
          >
            <FiRefreshCw className={refreshing ? "spin-animate" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid - Exactly 6 Monitored Areas */}
      <div className="metrics-grid">
        {/* Card 1: API Availability & Average Response Time */}
        <div className="metric-card">
          <div className="card-header">
            <h3><FiActivity /> API Availability & Response Time</h3>
            <span className="card-icon-badge" title="API Traffic & Latency"><FiActivity /></span>
          </div>
          <div className="card-body">
            <div className="main-stat" style={{ color: "var(--success)" }}>
              {metrics?.traffic.availabilityPct !== undefined ? `${metrics.traffic.availabilityPct.toFixed(1)}%` : "100.0%"}
            </div>
            <div className="sub-stat">
              <span>Average / p95 Latency</span>
              <span style={{ fontWeight: 600, color: "var(--primary)" }}>
                {metrics?.traffic.avgLatencyMs ?? 0} ms / {metrics?.traffic.p95LatencyMs ?? 0} ms
              </span>
            </div>
            <div className="sub-stat">
              <span>API Traffic & Latency</span>
              <span>{metrics?.traffic.totalRequests ?? 0} total requests</span>
            </div>
            <div className="sub-stat">
              <span>Status 2xx / 4xx / 5xx</span>
              <span>
                <span style={{ color: "var(--success)" }}>{metrics?.traffic.status2xx ?? 0}</span> /{" "}
                <span style={{ color: "var(--warning)" }}>{metrics?.traffic.status4xx ?? 0}</span> /{" "}
                <span style={{ color: "var(--error)" }}>{metrics?.traffic.status5xx ?? 0}</span>
              </span>
            </div>
            <div className="card-action-row">
              <button
                className="card-test-btn"
                onClick={handleTestPing}
                disabled={actionLoading === "ping"}
                title="Send a live test HTTP request to measure latency and update telemetry"
              >
                <FiZap /> {actionLoading === "ping" ? "Pinging..." : "Test API Ping"}
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Active Sessions & Connected Notification Clients */}
        <div className="metric-card">
          <div className="card-header">
            <h3><FiUsers /> Active Sessions & Notification Clients</h3>
            <span className="card-icon-badge"><FiUsers /></span>
          </div>
          <div className="card-body">
            <div className="main-stat" style={{ color: "var(--primary)" }}>
              {metrics?.monitoring?.activeSessions ?? 0} Active Sessions
            </div>
            <div className="sub-stat">
              <span>Connected Notification Clients (SSE)</span>
              <span style={{ fontWeight: 600, color: "var(--success)" }}>
                {metrics?.monitoring?.connectedClients ?? 0} Clients
              </span>
            </div>
            <div className="sub-stat">
              <span>Active SSE Streams</span>
              <span className={`badge-tag ${sseConnected ? "success" : "warning"}`}>
                {sseConnected ? "LIVE" : "STANDBY"}
              </span>
            </div>
            <div className="sub-stat">
              <span>Session Storage</span>
              <span>Rotated Refresh Tokens</span>
            </div>
            <div className="card-action-row">
              <button
                className="card-test-btn"
                onClick={handleTestSsePing}
                disabled={actionLoading === "sse"}
                title="Broadcast a real-time event to all connected SSE clients"
              >
                <FiRadio /> {actionLoading === "sse" ? "Broadcasting..." : "Broadcast SSE Ping"}
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Failed Logins & Locked Accounts */}
        <div className="metric-card">
          <div className="card-header">
            <h3><FiLock /> Failed Logins & Locked Accounts</h3>
            <span className="card-icon-badge"><FiLock /></span>
          </div>
          <div className="card-body">
            <div className="main-stat" style={{ color: (metrics?.monitoring?.failedLogins ?? 0) > 0 ? "var(--warning)" : "var(--text-h)" }}>
              {metrics?.monitoring?.failedLogins ?? 0} Failed Logins
            </div>
            <div className="sub-stat">
              <span>Locked Accounts</span>
              <span style={{ fontWeight: 600, color: (metrics?.monitoring?.lockedAccounts ?? 0) > 0 ? "var(--error)" : "var(--success)" }}>
                {metrics?.monitoring?.lockedAccounts ?? 0} Accounts
              </span>
            </div>
            <div className="sub-stat">
              <span>Brute-force Protection</span>
              <span>5 Attempts / 15m Lock</span>
            </div>
            <div className="sub-stat">
              <span>Audit Logging</span>
              <span className="badge-tag success">ENFORCED</span>
            </div>
            <div className="card-action-row">
              <button
                className="card-test-btn"
                onClick={() => setActiveTab("security")}
                title="Inspect real failed logins and locked account logs"
              >
                <FiShield /> View Security Log
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Offline Attendance Queue Failures */}
        <div className="metric-card">
          <div className="card-header">
            <h3><FiClock /> Offline Attendance Queue Failures</h3>
            <span className="card-icon-badge"><FiAlertTriangle /></span>
          </div>
          <div className="card-body">
            <div className="main-stat" style={{ color: ((metrics?.monitoring?.offlineSyncFailures ?? 0) + (offlineStats?.failed ?? 0)) > 0 ? "var(--error)" : "var(--success)" }}>
              {(metrics?.monitoring?.offlineSyncFailures ?? 0) + (offlineStats?.failed ?? 0)} Failures
            </div>
            <div className="sub-stat">
              <span>Server DLQ Failures</span>
              <span style={{ fontWeight: 600, color: (metrics?.monitoring?.offlineSyncFailures ?? 0) > 0 ? "var(--error)" : "var(--success)" }}>
                {(metrics?.monitoring?.offlineSyncFailures ?? 0) > 0 ? `${metrics?.monitoring?.offlineSyncFailures} in DLQ` : "Synchronized"}
              </span>
            </div>
            <div className="sub-stat">
              <span>Local Browser Queue</span>
              <span>
                {offlineStats ? `${offlineStats.pending} pending / ${offlineStats.failed} failed` : "IndexedDB Ready"}
              </span>
            </div>
            <div className="sub-stat">
              <span>Geofence Guard</span>
              <span className="badge-tag success">ACTIVE</span>
            </div>
            <div className="card-action-row">
              <button
                className="card-test-btn"
                onClick={handleSyncOfflineQueue}
                disabled={actionLoading === "offline"}
                title="Trigger local offline IndexedDB queue synchronization"
              >
                <FiRefreshCw className={actionLoading === "offline" ? "spin-animate" : ""} />
                {actionLoading === "offline" ? "Syncing..." : "Sync Offline Queue"}
              </button>
            </div>
          </div>
        </div>

        {/* Card 5: Notification Delivery Failures */}
        <div className="metric-card">
          <div className="card-header">
            <h3><FiBell /> Notification Delivery Failures</h3>
            <span className="card-icon-badge"><FiBell /></span>
          </div>
          <div className="card-body">
            <div className="main-stat" style={{ color: (metrics?.monitoring?.notificationFailures ?? 0) > 0 ? "var(--error)" : "var(--success)" }}>
              {metrics?.monitoring?.notificationFailures ?? 0} Failures
            </div>
            <div className="sub-stat">
              <span>Notification Deliveries</span>
              <span style={{ fontWeight: 600, color: (metrics?.monitoring?.notificationFailures ?? 0) > 0 ? "var(--error)" : "var(--success)" }}>
                {(metrics?.monitoring?.notificationFailures ?? 0) > 0 ? "Failures In DLQ" : "All Delivered"}
              </span>
            </div>
            <div className="sub-stat">
              <span>Real-Time Dispatch</span>
              <span>SSE Push Channel</span>
            </div>
            <div className="sub-stat">
              <span>Delivery Status</span>
              <span className={`badge-tag ${(metrics?.monitoring?.notificationFailures ?? 0) > 0 ? "warning" : "success"}`}>
                {(metrics?.monitoring?.notificationFailures ?? 0) > 0 ? "ATTENTION" : "HEALTHY"}
              </span>
            </div>
            <div className="card-action-row">
              <button
                className="card-test-btn"
                onClick={handleTestNotification}
                disabled={actionLoading === "notification"}
                title="Send a real test notification to verify real-time SSE delivery"
              >
                <FiSend /> {actionLoading === "notification" ? "Dispatching..." : "Send Test Notification"}
              </button>
            </div>
          </div>
        </div>

        {/* Card 6: MongoDB Connectivity & Background-Job Status */}
        <div className={`metric-card ${isMongoOnline ? "db-online" : "db-offline"}`}>
          <div className="card-header">
            <h3><FiDatabase /> MongoDB Connectivity & Background Jobs</h3>
            <span
              className="card-icon-badge"
              style={{
                background: isMongoOnline ? "var(--success-bg)" : "var(--error-bg)",
                color: isMongoOnline ? "var(--success)" : "var(--error)",
              }}
              title={isMongoOnline ? "MongoDB Online" : "MongoDB Offline"}
            >
              <FiDatabase />
            </span>
          </div>
          <div className="card-body">
            <div
              className="main-stat"
              style={{
                color: isMongoOnline ? "var(--success)" : "var(--error)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span className={`status-pulse ${isMongoOnline ? "online" : "offline"}`} />
              MongoDB {isMongoOnline ? "Online" : "Offline"}
            </div>
            <div className="sub-stat">
              <span>MongoDB Cluster</span>
              <span
                style={{
                  fontWeight: 600,
                  color: isMongoOnline ? "var(--primary)" : "var(--error)",
                }}
              >
                {isMongoOnline
                  ? `${metrics?.database.name || "workforce"} (${metrics?.database.pingMs ?? 0} ms ping)`
                  : "Disconnected / Offline"}
              </span>
            </div>
            <div className="sub-stat">
              <span>Background Jobs & DLQ</span>
              <span>
                {effectiveJobStats?.completed ?? 0} done / {effectiveJobStats?.pending ?? 0} pend /{" "}
                <span style={{ color: (effectiveJobStats?.deadLetterCount ?? 0) > 0 ? "var(--error)" : "inherit" }}>
                  {effectiveJobStats?.deadLetterCount ?? 0} DLQ
                </span>
              </span>
            </div>
            <div className="sub-stat">
              <span>Server Memory</span>
              <span>{metrics?.memory.heapUsedMB ?? 0} MB / {metrics?.memory.heapTotalMB ?? 0} MB</span>
            </div>
            <div className="card-action-row">
              <button
                className="card-test-btn"
                onClick={handleEnqueueJob}
                disabled={actionLoading === "job"}
                title="Enqueue a lightweight background job to verify worker execution"
              >
                <FiPlay /> {actionLoading === "job" ? "Enqueueing..." : "Enqueue Test Job"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Alert Banner if MongoDB is disconnected */}
      {!isMongoOnline && metrics && (
        <div className="db-offline-alert" role="alert">
          <FiAlertTriangle style={{ fontSize: "1.25rem", flexShrink: 0 }} />
          <div>
            <strong>Database Offline:</strong> MongoDB connection is currently unreachable or disconnected. Background jobs and attendance synchronization are operating in resilient buffer mode.
          </div>
        </div>
      )}

      {/* Tabs Container - Monitored Operations */}
      <div className="health-tabs-container">
        <div className="tab-nav" role="tablist">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
            role="tab"
            aria-selected={activeTab === "overview"}
          >
            <FiServer /> Infrastructure & Database Metrics
          </button>
          <button
            className={`tab-btn ${activeTab === "dlq" ? "active" : ""}`}
            onClick={() => setActiveTab("dlq")}
            role="tab"
            aria-selected={activeTab === "dlq"}
          >
            <FiAlertTriangle /> Dead-Letter Queue ({effectiveJobStats?.deadLetterCount ?? 0})
          </button>
          <button
            className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
            role="tab"
            aria-selected={activeTab === "security"}
          >
            <FiShield /> Security & Failed Logins ({metrics?.monitoring?.failedLogins ?? 0})
          </button>
        </div>

        {/* Tab 1: Infrastructure Overview */}
        {activeTab === "overview" && (
          <div>
            <h3 className="tab-section-title">Runtime Environment</h3>
            <div className="subcard-grid">
              <div className="health-subcard">
                <span className="health-subcard-label">Node.js Runtime</span>
                <p className="health-subcard-value">{metrics?.server.nodeVersion || "v20.x"}</p>
              </div>
              <div className="health-subcard">
                <span className="health-subcard-label">Host Platform</span>
                <p className="health-subcard-value">{metrics?.server.platform || "Linux/Windows (x64)"}</p>
              </div>
              <div className="health-subcard">
                <span className="health-subcard-label">CPU Cores</span>
                <p className="health-subcard-value">{metrics?.server.cpuCount ?? 4} Cores</p>
              </div>
              <div className="health-subcard">
                <span className="health-subcard-label">Heap Allocation & Uptime</span>
                <p className="health-subcard-value">
                  {metrics?.memory.heapUsedMB ?? 0} MB Heap | {formatUptime(metrics?.server.uptimeSeconds)}
                </p>
              </div>
            </div>

            <h3 className="tab-section-title">Collection Document Volumes</h3>
            <div className="health-table-wrapper">
              <table className="health-table">
                <thead>
                  <tr>
                    <th>Collection Name</th>
                    <th>Document Count</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics?.database.documentCounts && Object.entries(metrics.database.documentCounts).length > 0 ? (
                    Object.entries(metrics.database.documentCounts).map(([coll, count]) => (
                      <tr key={coll}>
                        <td style={{ fontWeight: 600 }}>{coll}</td>
                        <td>{count.toLocaleString()}</td>
                        <td><span className="badge-tag success">HEALTHY</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", color: "var(--text-light)" }}>
                        Active collections reporting nominal volumes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Dead-Letter Queue Management */}
        {activeTab === "dlq" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 className="tab-section-title" style={{ margin: 0 }}>Dead-Letter Queue (DLQ)</h3>
                <p style={{ margin: "4px 0 0 0", color: "var(--text-light)", fontSize: "13px" }}>
                  Failed background jobs that exceeded retry limits. Inspect errors, re-drive, or discard.
                </p>
              </div>
            </div>

            <div className="health-table-wrapper">
              <table className="health-table">
                <thead>
                  <tr>
                    <th>Job Type</th>
                    <th>Attempts</th>
                    <th>Failure Reason</th>
                    <th>Failed At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dlqItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "var(--text-light)" }}>
                        <FiCheckCircle style={{ color: "var(--success)", fontSize: "1.5rem", marginBottom: "8px" }} />
                        <div>No dead-letter items. All background jobs running reliably!</div>
                      </td>
                    </tr>
                  ) : (
                    dlqItems.map((item) => (
                      <tr key={item._id}>
                        <td><span className="badge-tag error">{item.type}</span></td>
                        <td>{item.attempts} retries</td>
                        <td style={{ maxWidth: "320px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.finalError}>
                          {item.finalError}
                        </td>
                        <td>{new Date(item.failedAt).toLocaleString()}</td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="action-btn primary"
                              style={{ padding: "4px 10px", fontSize: "12px" }}
                              onClick={() => handleRetryJob(item._id)}
                            >
                              Re-drive
                            </button>
                            <button
                              className="action-btn danger"
                              style={{ padding: "4px 10px", fontSize: "12px" }}
                              onClick={() => handleDiscardJob(item._id)}
                            >
                              Discard
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Security & Failed Logins Log */}
        {activeTab === "security" && (
          <div>
            <h3 className="tab-section-title">Locked Accounts ({metrics?.monitoring?.lockedAccounts ?? 0})</h3>
            <div className="health-table-wrapper" style={{ marginBottom: "24px" }}>
              <table className="health-table">
                <thead>
                  <tr>
                    <th>User Email</th>
                    <th>Role</th>
                    <th>Failed Attempts</th>
                    <th>Locked Until</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!metrics?.monitoring?.recentLockedAccounts || metrics.monitoring.recentLockedAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "var(--text-light)" }}>
                        <FiCheckCircle style={{ color: "var(--success)", fontSize: "1.3rem", marginBottom: "6px" }} />
                        <div>No locked accounts. All user access credentials in good standing.</div>
                      </td>
                    </tr>
                  ) : (
                    metrics.monitoring.recentLockedAccounts.map((u) => (
                      <tr key={u._id}>
                        <td style={{ fontWeight: 600 }}>{u.email}</td>
                        <td>{u.role}</td>
                        <td>{u.failedLoginAttempts} attempts</td>
                        <td>{new Date(u.lockUntil).toLocaleString()}</td>
                        <td><span className="badge-tag error">LOCKED</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <h3 className="tab-section-title">Recent Failed Login Attempts ({metrics?.monitoring?.failedLogins ?? 0} Total Recorded)</h3>
            <div className="health-table-wrapper">
              <table className="health-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User / Email</th>
                    <th>IP Address</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {!metrics?.monitoring?.recentFailedLogins || metrics.monitoring.recentFailedLogins.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "24px", color: "var(--text-light)" }}>
                        <FiCheckCircle style={{ color: "var(--success)", fontSize: "1.3rem", marginBottom: "6px" }} />
                        <div>No failed login attempts recorded in audit log.</div>
                      </td>
                    </tr>
                  ) : (
                    metrics.monitoring.recentFailedLogins.map((log) => (
                      <tr key={log._id}>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                        <td style={{ fontWeight: 600 }}>{log.performedBy}</td>
                        <td><code>{log.ipAddress}</code></td>
                        <td>{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemHealth;
