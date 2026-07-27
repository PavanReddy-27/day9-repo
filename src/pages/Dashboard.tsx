function Dashboard() {
  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Welcome back! Here is your workforce
            overview for today.
          </p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span>Total Employees</span>
          <strong>12,482</strong>
        </div>

        <div className="kpi-card">
          <span>Active Employees</span>
          <strong>11,920</strong>
        </div>

        <div className="kpi-card">
          <span>New Hires</span>
          <strong>248</strong>
        </div>

        <div className="kpi-card">
          <span>Attrition Rate</span>
          <strong>8.4%</strong>
        </div>
      </div>

      <div className="analytics-card">
        <h2>Workforce Overview</h2>

        <p>
          Your workforce is performing well
          this month.
        </p>
      </div>
    </section>
  );
}

export default Dashboard;