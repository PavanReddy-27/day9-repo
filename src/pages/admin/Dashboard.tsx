import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { Download } from "@mui/icons-material";
import KPICards from "../../features/kpi/components/KPICards";
import type { KPIItem } from "../../features/kpi/components/KPICards/KPICards";
import EmployeeTrendChart from "../../features/charts/components/EmployeeTrendChart";
import DepartmentChart from "../../features/charts/components/DepartmentChart";
import RoleChart from "../../features/charts/components/RoleChart";
import StatusChart from "../../features/charts/components/StatusChart";
import type { TrendChartData, DepartmentChartData, RoleChartData, StatusChartData } from "../../types/chart";
import PageState from "../../components/PageState";
import {
  getWorkforceAnalytics,
  getHiringAnalytics,
  getDepartmentAnalytics,
  subscribeToAnalytics,
} from "../../services/analyticsService";
import "./Dashboard.css";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [kpiData, setKpiData] = useState<KPIItem[]>([]);
  const [trendData, setTrendData] = useState<TrendChartData[]>([]);
  const [departmentData, setDepartmentData] = useState<DepartmentChartData[]>([]);
  const [statusData, setStatusData] = useState<StatusChartData[]>([]);
  const [roleData, setRoleData] = useState<RoleChartData[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [wf, hiring, dept] = await Promise.all([
          getWorkforceAnalytics().catch(() => null),
          getHiringAnalytics().catch(() => null),
          getDepartmentAnalytics().catch(() => null),
        ]);

        if (!isMounted) return;

        if (!wf) {
          throw new Error("Unable to fetch workforce analytics");
        }

        setKpiData([
          { id: "totalEmployees", title: "Total Users", value: wf.totalEmployees || 0, trend: 5 },
          { id: "activeEmployees", title: "Active Roles", value: wf.activeEmployees || 0, trend: 2 },
          { id: "departments", title: "Departments", value: dept?.departments?.length || 0, trend: 0 },
          { id: "attendanceRate", title: "Attendance Rate", value: `${Math.round(((wf.activeEmployees || 0) / (wf.totalEmployees || 1)) * 100)}%`, trend: 3 },
        ]);

        if (wf.statusDistribution) {
          const total = wf.totalEmployees || 1;
          setStatusData(
            wf.statusDistribution.map((s, idx) => ({
              id: `s${idx}`,
              status: s.name,
              employees: s.value,
              percentage: Math.round((s.value / total) * 100),
            }))
          );
        }

        if (dept?.departments) {
          setDepartmentData(
            dept.departments.map((d, idx) => ({
              id: `d${idx}`,
              name: d.name,
              value: d.count,
              activeEmployees: d.count,
              inactiveEmployees: 0,
              averageSalary: 75000,
              averageExperience: 5,
              performanceScore: 85,
              trainingCompletion: 90,
            }))
          );
        }

        if (hiring && Array.isArray(hiring)) {
          setTrendData(
            hiring.map((h) => ({
              month: h.month,
              totalEmployees: h.hires * 10,
              activeEmployees: h.hires * 9,
              newHires: h.hires,
              attrition: Math.floor(h.hires * 0.1),
            }))
          );
        }

        if (wf.workModeDistribution) {
          setRoleData(
            wf.workModeDistribution.map((w, idx) => ({
              id: `r${idx}`,
              role: w.name,
              employees: w.value,
              averageSalary: 70000 + idx * 5000,
              averageExperience: 4 + idx,
            }))
          );
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load dashboard data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    const unsubscribe = subscribeToAnalytics(() => {
      if (isMounted) loadData();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleExportCSV = () => {
    const csvContent = [
      ["Metric", "Value"],
      ...kpiData.map((k) => [k.title, String(k.value)]),
      ["--- Departments ---", ""],
      ...departmentData.map((d) => [d.name, String(d.value)]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `admin_dashboard_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="admin-dashboard-container">
      <div className="dashboard-page">
        <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div className="dashboard-title-section">
            <h1>Dashboard</h1>
            <p>Overview of your employee performance and analytics.</p>
          </div>
          <Button variant="outlined" startIcon={<Download />} onClick={handleExportCSV} sx={{ borderRadius: 2 }}>
            Export CSV
          </Button>
        </div>

        {loading ? (
          <PageState type="loading" message="Fetching live Admin Dashboard metrics..." />
        ) : error ? (
          <PageState type="error" message={error} onRetry={() => window.location.reload()} />
        ) : (
          <>
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
          </>
        )}
      </div>
    </main>
  );
};

export default Dashboard;