const Reports = () => {
    return (
      <div className="dashboard-section">
        <h2>Reports</h2>
        <p>Reports page.</p>
      </div>
    );
  };
  
  export default Reports;
function Reports() {
  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Reports</h1>

          <p>
            Analyze workforce performance
            through detailed reports.
          </p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span>Monthly Headcount</span>
          <strong>12,482</strong>
        </div>

        <div className="kpi-card">
          <span>Retention Rate</span>
          <strong>91.6%</strong>
        </div>

        <div className="kpi-card">
          <span>Average Tenure</span>
          <strong>4.8 yrs</strong>
        </div>

        <div className="kpi-card">
          <span>Productivity</span>
          <strong>87%</strong>
        </div>
      </div>

      <div className="analytics-card">
        <h2>Available Reports</h2>

        <p>
          Workforce Summary Report
        </p>

        <p>
          Employee Attrition Report
        </p>

        <p>
          Department Performance Report
        </p>

        <p>
          Employee Engagement Report
        </p>
      </div>
    </section>
  );
}

export default Reports;
