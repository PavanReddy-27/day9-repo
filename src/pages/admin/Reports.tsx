import "./Reports.css";

const Reports = () => {
  return (
    <div className="admin-reports-page">
      <div className="page-heading">
        <div>
          <h1>Reports</h1>
          <p>Export employee and attendance reports with one click. Perfect for audits and stakeholder insights.</p>
        </div>
      </div>

      <div className="report-grid">
        <div className="report-card">
          <p>Employee Report</p>
          <button>Export CSV</button>
        </div>

        <div className="report-card">
          <p>Attendance Report</p>
          <button>Export PDF</button>
        </div>
      </div>
    </div>
  );
};

export default Reports;