import "./AuditLogs.css";

const AuditLogs = () => {
  const logs = [
    {
      id: 1,
      user: "Admin",
      action: "Created User",
      date: "30-07-2026",
    },
    {
      id: 2,
      user: "HR",
      action: "Updated Employee",
      date: "31-07-2026",
    },
  ];

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
              <th>User</th>
              <th>Action</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.user}</td>
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