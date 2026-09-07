import { useEffect, useState } from "react";
import KPICards from "../../features/kpi/components/KPICards";
import type { KPIItem } from "../../features/kpi/components/KPICards/KPICards";
import EmployeeTrendChart from "../../features/charts/components/EmployeeTrendChart";
import DepartmentChart from "../../features/charts/components/DepartmentChart";
import RoleChart from "../../features/charts/components/RoleChart";
import StatusChart from "../../features/charts/components/StatusChart";
import type { TrendChartData, DepartmentChartData, RoleChartData, StatusChartData } from "../../types/chart";
import {
  getWorkforceAnalytics,
  getDepartmentAnalytics,
  getHiringAnalytics,
  WorkforceAnalyticsResponse,
  DepartmentAnalyticsResponse,
  HiringAnalyticsResponse
} from "../../services/analyticsService";
import { CircularProgress, Alert, Button } from "@mui/material";
import "./Dashboard.css";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workforceData, setWorkforceData] = useState<WorkforceAnalyticsResponse | null>(null);
  const [deptData, setDeptData] = useState<DepartmentAnalyticsResponse | null>(null);
  const [hiringData, setHiringData] = useState<HiringAnalyticsResponse[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [wf, dept, hiring] = await Promise.all([
        getWorkforceAnalytics(),
        getDepartmentAnalytics(),
        getHiringAnalytics(),
      ]);
      setWorkforceData(wf);
      setDeptData(dept);
      setHiringData(Array.isArray(hiring) ? hiring : []);
    } catch (err: any) {
      console.error("Failed to load admin dashboard analytics:", err);
      setError(err?.message || "Failed to load dashboard data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <main className="admin-dashboard-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </main>
    );
  }

  if (error || !workforceData || !deptData) {
    return (
      <main className="admin-dashboard-container" style={{ padding: 24 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchDashboardData}>
            Retry
          </Button>
        }>
          {error || "Unable to load organization analytics from backend."}
        </Alert>
      </main>
    );
  }

  const kpiData: KPIItem[] = [
    { id: "totalEmployees", title: "Total Workforce", value: workforceData.totalEmployees, trend: 0 },
    { id: "activeEmployees", title: "Active Employees", value: workforceData.activeEmployees, trend: 0 },
    { id: "departments", title: "Departments", value: deptData.departments.length, trend: 0 },
    { id: "performanceScore", title: "Locations", value: deptData.locations.length, trend: 0 },
  ];

  // Real hiring trends from MongoDB
  const trendData: TrendChartData[] = hiringData.map((h) => ({
    month: h.month,
    totalEmployees: workforceData.totalEmployees,
    activeEmployees: workforceData.activeEmployees,
    newHires: h.hires,
    attrition: 0,
  }));

  // Real status distribution from MongoDB
  const totalEmployees = workforceData.totalEmployees || 1;
  const statusData: StatusChartData[] = (workforceData.statusDistribution || []).map((s, i) => ({
    id: `status_${i}`,
    status: s.name,
    employees: s.value,
    percentage: Math.round((s.value / totalEmployees) * 100),
  }));

  // Real department distribution from MongoDB
  const departmentData: DepartmentChartData[] = (deptData.departments || []).map((d, i) => ({
    id: `dept_${i}`,
    name: d.name,
    value: d.count,
    activeEmployees: d.count,
    inactiveEmployees: 0,
    averageSalary: 0,
    averageExperience: 0,
    performanceScore: 0,
    trainingCompletion: 0,
  }));

  // Real role/work mode distribution from MongoDB
  const roleData: RoleChartData[] = (workforceData.workModeDistribution || []).map((w, i) => ({
    id: `role_${i}`,
    role: `${w.name} Mode`,
    employees: w.value,
    averageSalary: 0,
    averageExperience: 0,
  }));

  return (
    <main className="admin-dashboard-container">
      <div className="dashboard-page">
        <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div className="dashboard-title-section">
            <h1>Admin Overview</h1>
            <p>Live workforce analytics and department statistics from MongoDB.</p>
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