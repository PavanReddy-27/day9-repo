function Reports() {
  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p>Analyze workforce performance through detailed reports.</p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">Monthly Headcount</div>
        <div className="kpi-card">Retention Rate</div>
        <div className="kpi-card">Average Tenure</div>
        <div className="kpi-card">Productivity</div>
      </div>

      <div className="analytics-card">
        <h2>Available Reports</h2>
        <ul>
          <li>Workforce Summary Report</li>
          <li>Employee Attrition Report</li>
          <li>Department Performance Report</li>
          <li>Employee Engagement Report</li>
        </ul>
      </div>
    </section>
  );
}

export default Reports;