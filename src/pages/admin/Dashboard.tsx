import KPICards from "../../features/kpi/components/KPICards";
import type { KPIItem } from "../../features/kpi/components/KPICards/KPICards";
import EmployeeTrendChart from "../../features/charts/components/EmployeeTrendChart";
import DepartmentChart from "../../features/charts/components/DepartmentChart";
import RoleChart from "../../features/charts/components/RoleChart";
import StatusChart from "../../features/charts/components/StatusChart";
import type { TrendChartData, DepartmentChartData, RoleChartData, StatusChartData } from "../../types/chart";
import "./Dashboard.css";

const kpiData: KPIItem[] = [
  { id: "totalEmployees", title: "Total Users", value: 250, trend: 5 },
  { id: "activeEmployees", title: "Active Roles", value: 18, trend: 2 },
  { id: "departments", title: "Departments", value: 12, trend: 0 },
  { id: "performanceScore", title: "Reports", value: 42, trend: 10 },
];

const trendData: TrendChartData[] = [
  { month: "Jan", totalEmployees: 120, activeEmployees: 110, newHires: 8, attrition: 3 },
  { month: "Feb", totalEmployees: 140, activeEmployees: 130, newHires: 12, attrition: 5 },
  { month: "Mar", totalEmployees: 170, activeEmployees: 160, newHires: 15, attrition: 4 },
  { month: "Apr", totalEmployees: 190, activeEmployees: 180, newHires: 20, attrition: 6 },
  { month: "May", totalEmployees: 230, activeEmployees: 220, newHires: 22, attrition: 8 },
  { month: "Jun", totalEmployees: 250, activeEmployees: 240, newHires: 18, attrition: 5 },
];

const departmentData: DepartmentChartData[] = [
  { id: "d1", name: "Engineering", value: 40, activeEmployees: 38, inactiveEmployees: 2, averageSalary: 80000, averageExperience: 5, performanceScore: 85, trainingCompletion: 90 },
  { id: "d2", name: "HR", value: 20, activeEmployees: 19, inactiveEmployees: 1, averageSalary: 60000, averageExperience: 4, performanceScore: 80, trainingCompletion: 85 },
  { id: "d3", name: "Sales", value: 25, activeEmployees: 23, inactiveEmployees: 2, averageSalary: 70000, averageExperience: 6, performanceScore: 88, trainingCompletion: 95 },
  { id: "d4", name: "Finance", value: 15, activeEmployees: 15, inactiveEmployees: 0, averageSalary: 75000, averageExperience: 7, performanceScore: 90, trainingCompletion: 100 },
];

const statusData: StatusChartData[] = [
  { id: "s1", status: "Active", employees: 200, percentage: 80 },
  { id: "s2", status: "On Leave", employees: 30, percentage: 12 },
  { id: "s3", status: "Onboarding", employees: 20, percentage: 8 },
];

const roleData: RoleChartData[] = [
  { id: "r1", role: "IT", employees: 70, averageSalary: 80000, averageExperience: 5 },
  { id: "r2", role: "HR", employees: 30, averageSalary: 60000, averageExperience: 4 },
  { id: "r3", role: "Sales", employees: 55, averageSalary: 70000, averageExperience: 6 },
  { id: "r4", role: "Finance", employees: 25, averageSalary: 75000, averageExperience: 7 },
];

const Dashboard = () => {
  return (
      <main className="admin-dashboard-container">
        <div className="dashboard-page">
          <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div className="dashboard-title-section">
              <h1>Dashboard</h1>
              <p>Overview of your employee performance and analytics.</p>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <KPICards data={kpiData} />
          </div>

          <div className="dashboard-box">
            <EmployeeTrendChart data={trendData} />
            <StatusChart data={statusData} />
          </div>

          <div className="dashboard-box">
            <RoleChart data={roleData} />
            <DepartmentChart data={departmentData} />
          </div>
        </div>
      </main>
  );
};

export default Dashboard;