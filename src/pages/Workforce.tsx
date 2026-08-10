import { useState } from "react";

type PageStatus =
  | "loading"
  | "success"
  | "error"
  | "empty";

function Workforce() {
  const [status] =
    useState<PageStatus>("success");

  if (status === "loading") {
    return (
      <div className="page-state">
        <div className="spinner" />

        <h3>Loading Workforce Data</h3>

        <p>
          Please wait while we load
          workforce analytics.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page-state error">
        <h3>
          Unable to Load Workforce Data
        </h3>

        <p>
          Something went wrong while
          loading workforce data.
        </p>

        <button>
          Try Again
        </button>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="page-state">
        <h3>No Workforce Data</h3>

        <p>
          No workforce records are
          available for the selected filters.
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Workforce Analytics</h1>

          <p>
            Monitor workforce trends,
            employee engagement and
            organizational performance.
          </p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span>Total Employees</span>
          <strong>12,482</strong>
        </div>

        <div className="kpi-card">
          <span>Attrition Rate</span>
          <strong>8.4%</strong>
        </div>

        <div className="kpi-card">
          <span>Employee Engagement</span>
          <strong>84%</strong>
        </div>

        <div className="kpi-card">
          <span>Open Positions</span>
          <strong>126</strong>
        </div>
      </div>

      <div className="analytics-card">
        <h2>Workforce Overview</h2>

        <p>
          Workforce analytics and
          organizational trends will
          appear here.
        </p>
      </div>
    </section>
  );
}

export default Workforce;