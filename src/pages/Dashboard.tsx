import Sidebar from "../components/Sidebar";
import KPICard from "../components/KPICard";
import EmployeeGrowthChart from "../components/EmployeeGrowthChart";
import EmployeeBarChart from "../components/EmployeeBarChart";
import DepartmentDonutChart from "../components/DepartmentDonutChart";

import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>
            Overview of your employee performance and analytics
          </p>
        </div>

        {/* KPI Cards */}

        <div className="cards">
          <KPICard
            title="Total Employees"
            value="250"
            color="#3B82F6"
          />

          <KPICard
            title="Active Users"
            value="220"
            color="#10B981"
          />

          <KPICard
            title="Departments"
            value="12"
            color="#F59E0B"
          />

          <KPICard
            title="Reports"
            value="42"
            color="#8B5CF6"
          />
        </div>

        <div className="dashboard-box">
          <div className="chart-box">
            <h2>Employee Growth</h2>
            <EmployeeGrowthChart />
          </div>

          <div className="chart-box">
            <h2>Department Wise Employees</h2>
            <EmployeeBarChart />
          </div>
        </div>

        <div className="chart-box donut-box">
          <h2>Department Distribution</h2>
          <DepartmentDonutChart />
        </div>

        {/* Employees Table */}

        <div className="table-box">
          <h2>Recent Employees</h2>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>John Doe</td>
                <td>john@gmail.com</td>
                <td>Engineering</td>
                <td>
                  <span className="status-active">
                    Active
                  </span>
                </td>
              </tr>

              <tr>
                <td>Jane Smith</td>
                <td>jane@gmail.com</td>
                <td>HR</td>
                <td>
                  <span className="status-active">
                    Active
                  </span>
                </td>
              </tr>

              <tr>
                <td>Robert</td>
                <td>robert@gmail.com</td>
                <td>Finance</td>
                <td>
                  <span className="status-inactive">
                    Inactive
                  </span>
                </td>
              </tr>

              <tr>
                <td>David</td>
                <td>david@gmail.com</td>
                <td>Sales</td>
                <td>
                  <span className="status-active">
                    Active
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;