import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <section className="welcome-banner">
        <div>
          <h2>👋 Welcome Back, team 2</h2>
          <p>
            Here's a quick overview of your workforce analytics. Monitor employee
            performance, trends and organizational health from one place.
          </p>
        </div>

        <button className="banner-btn">View Reports</button>
      </section>

      {/* Filters */}
      <section className="dashboard-card">
        <div className="section-header">
          <h3>Filters</h3>
        </div>

        <div className="filters-grid">
          <div className="filter-box">Department</div>
          <div className="filter-box">Role</div>
          <div className="filter-box">Location</div>
          <div className="filter-box">Status</div>
          <div className="filter-box">Risk</div>
          <div className="filter-box">Date</div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="dashboard-card">
        <div className="section-header">
          <h3>Key Performance Indicators</h3>
        </div>

        <div className="kpi-grid">
          <div className="placeholder-card">Total Employees</div>
          <div className="placeholder-card">Active Employees</div>
          <div className="placeholder-card">Attrition Rate</div>
          <div className="placeholder-card">Performance Score</div>
          <div className="placeholder-card">Departments</div>
          <div className="placeholder-card">Locations</div>
          <div className="placeholder-card">High Risk</div>
          <div className="placeholder-card">New Joinees</div>
        </div>
      </section>

      {/* Charts */}
      <section className="dashboard-card">
        <div className="section-header">
          <h3>Analytics</h3>
        </div>

        <div className="chart-grid">
          <div className="chart-placeholder">
            Workforce Trend Chart
          </div>

          <div className="chart-placeholder">
            Department Distribution
          </div>

          <div className="chart-placeholder">
            Location / Role Chart
          </div>
        </div>
      </section>

      {/* Employee Table */}
      <section className="dashboard-card">
        <div className="section-header">
          <h3>Employee Table</h3>
        </div>

        <div className="table-placeholder">
          Employee Table Component
        </div>
      </section>

      {/* KPI Drilldown */}
      <section className="dashboard-card">
        <div className="section-header">
          <h3>KPI Drill Down</h3>
        </div>

        <div className="drilldown-placeholder">
          KPI Drill Down Panel
        </div>
      </section>
    </div>
  );
};
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