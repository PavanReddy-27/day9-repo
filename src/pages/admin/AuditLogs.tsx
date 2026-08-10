import auditService from "../../services/auditService";
import "./AuditLogs.css";

const AuditLogs = () => {
  const logs = auditService.getAllLogs();

  return (
    <div className="admin-audit-page">
      <div className="audit-header">
        <h1>Audit Logs</h1>
        <p className="audit-description">Review the latest changes and user actions in one clean audit timeline.</p>
      </div>

      <div className="audit-table-wrapper">
        <table className="audit-logs-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User (Role)</th>
              <th>Action</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.user} ({log.role})</td>
                <td>{log.action}</td>
                <td>{log.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;