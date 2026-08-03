import { FaUsers, FaClipboardList, FaBuilding, FaFileAlt } from "react-icons/fa";
import KPICard from "../../components/KPICard";
import EmployeeGrowthChart from "../../components/EmployeeGrowthChart";
import EmployeeBarChart from "../../components/EmployeeBarChart";
import MonthlyHiringChart from "../../components/MonthlyHiringChart";
import DepartmentDonutChart from "../../components/DepartmentDonutChart";
import "./Dashboard.css";

const stats = [
  { title: "Total Users", value: 250, icon: <FaUsers />, color: "#4F46E5" },
  { title: "Active Roles", value: 18, icon: <FaClipboardList />, color: "#10B981" },
  { title: "Departments", value: 12, icon: <FaBuilding />, color: "#F59E0B" },
  { title: "Reports", value: 42, icon: <FaFileAlt />, color: "#EF4444" },
];

const Dashboard = () => {
  return (
      <main className="dashboard-content">
        <div className="dashboard-page">
          <div className="dashboard-header">
            <div className="dashboard-title-section">
              <h1>Dashboard</h1>
              <p>Overview of your employee performance and analytics.</p>
            </div>
          </div>

          <div className="cards">
            {stats.map((item) => (
              <KPICard
                key={item.title}
                title={item.title}
                value={item.value}
                color={item.color}
                icon={item.icon}
              />
            ))}
          </div>

          <div className="dashboard-box">
            <div className="chart-box">
              <div className="chart-header">
                <div>
                  <h2>Employee Growth</h2>
                  <p className="chart-subtitle">Monthly headcount trend</p>
                </div>
              </div>
              <EmployeeGrowthChart />
            </div>

            <div className="chart-box">
              <div className="chart-header">
                <div>
                  <h2>Monthly Hiring vs Exits</h2>
                  <p className="chart-subtitle">New hires and attrition</p>
                </div>
              </div>
              <MonthlyHiringChart />
            </div>
          </div>

          <div className="dashboard-box">
            <div className="chart-box">
              <div className="chart-header">
                <div>
                  <h2>Department Employees</h2>
                  <p className="chart-subtitle">Active employee distribution</p>
                </div>
              </div>
              <EmployeeBarChart />
            </div>

            <div className="chart-box donut-box">
              <div className="chart-header">
                <div>
                  <h2>Department Distribution</h2>
                  <p className="chart-subtitle">Share of employees by department</p>
                </div>
              </div>
              <DepartmentDonutChart />
            </div>
          </div>
        </div>
      </main>
  );
};

export default Dashboard;