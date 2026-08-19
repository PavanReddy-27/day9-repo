import { useEffect, useState } from "react";
import { apiClient } from "../../services/apiClient";
import "./AuditLogs.css";

interface AuditEntry {
  _id: string;
  performedBy: string;
  userRole: string;
  action: string;
  details: string;
  entityType?: string;
  ipAddress?: string;
  timestamp: string;
}

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Real, MongoDB-backed audit trail (Admin/HR only, company-scoped).
        const qs = search ? `?search=${encodeURIComponent(search)}&limit=200` : "?limit=200";
        const data = await apiClient<AuditEntry[]>(`/audit-logs${qs}`);
        if (active) setLogs(Array.isArray(data) ? data : []);
      } catch {
        if (active) setError("Unable to load audit logs from the server.");
      } finally {
        if (active) setLoading(false);
      }
    };
    const t = setTimeout(load, search ? 300 : 0);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [search]);

  const fmt = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <div className="admin-audit-page">
      <div className="audit-header">
        <h1>Audit Logs</h1>
        <p className="audit-description">
          Every sensitive action (logins, leave decisions, attendance corrections) recorded from MongoDB.
        </p>
        <input
          type="text"
          placeholder="Search action, user or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border, #ccc)", minWidth: 280 }}
        />
      </div>

      <div className="audit-table-wrapper">
        {loading ? (
          <p style={{ padding: 16, opacity: 0.7 }}>Loading audit trail…</p>
        ) : error ? (
          <p style={{ padding: 16, color: "#DC2626" }}>{error}</p>
        ) : logs.length === 0 ? (
          <p style={{ padding: 16, opacity: 0.7 }}>No audit entries yet.</p>
        ) : (
          <table className="audit-logs-table">
            <thead>
              <tr>
                <th>User (Role)</th>
                <th>Action</th>
                <th>Details</th>
                <th>IP</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>{log.performedBy} ({log.userRole})</td>
                  <td>{log.action}</td>
                  <td>{log.details}</td>
                  <td>{log.ipAddress || "—"}</td>
                  <td>{fmt(log.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
