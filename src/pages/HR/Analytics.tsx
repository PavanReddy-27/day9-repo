import { Box, Typography, CircularProgress } from "@mui/material";
import { Analytics as AnalyticsIcon } from "@mui/icons-material";
import KPICards from "../../features/kpi/components/KPICards";
import EmployeeTrendChart from "../../features/charts/components/EmployeeTrendChart";
import RoleChart from "../../features/charts/components/RoleChart";
import DepartmentChart from "../../features/charts/components/DepartmentChart";
import type { TrendChartData, DepartmentChartData } from "../../types/chart";

import { useEffect, useState } from "react";
import {
  getWorkforceAnalytics,
  getHiringAnalytics,
  getDepartmentAnalytics,
  subscribeToAnalytics
} from "../../services/analyticsService";

const HRAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [workforceData, setWorkforceData] = useState<any>(null);
  const [hiringData, setHiringData] = useState<any>(null);
  const [deptData, setDeptData] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [wfRes, hireRes, deptRes] = await Promise.all([
        getWorkforceAnalytics(),
        getHiringAnalytics(),
        getDepartmentAnalytics(),
      ]);
      setWorkforceData(wfRes);
      setHiringData(hireRes);
      setDeptData(deptRes);
    } catch (e) {
      console.error("Failed to fetch analytics", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = subscribeToAnalytics(() => {
      // Re-fetch data whenever an event is received
      fetchData();
    });
    return unsubscribe;
  }, []);

  if (loading || !workforceData) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const kpiData = [
    { id: "totalEmployees" as const, title: "Total Headcount", value: workforceData.totalEmployees.toLocaleString(), trend: 0 },
    { id: "activeEmployees" as const, title: "Active Employees", value: workforceData.activeEmployees.toLocaleString(), trend: 0 },
    { id: "engagementScore" as const, title: "Retention Rate", value: `${workforceData.retentionRate}%`, trend: 0 },
    { id: "attritionRate" as const, title: "Attrition Rate", value: `${workforceData.attritionRate}%`, trend: 0 },
  ];

  // Map backend department stats to frontend chart format
  const headcountData = (deptData?.departments || []).map((d: any, idx: number) => ({
    id: String(idx),
    role: d.name,
    employees: d.count,
    averageSalary: 0,
    averageExperience: 0,
  }));

  // Map hiring data to attrition trend (simulated for now using hiring data)
  const attritionTrend: TrendChartData[] = (hiringData || []).map((h: any) => ({
    month: h.month,
    activeEmployees: workforceData.activeEmployees,
    totalEmployees: workforceData.totalEmployees,
    newHires: h.hires,
    attrition: workforceData.attritionRate,
  }));

  // Work Mode distribution for DepartmentChart
  const workModeData: DepartmentChartData[] = Object.entries(workforceData.workModeDistribution || {}).map(([mode, count], idx) => ({
    id: String(idx),
    name: mode,
    value: count as number,
    activeEmployees: 0, inactiveEmployees: 0, averageSalary: 0, averageExperience: 0, performanceScore: 0, trainingCompletion: 0
  }));

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: "var(--text-h)", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
          <AnalyticsIcon fontSize="large" sx={{ color: "var(--primary)" }} /> HR Analytics
        </Typography>
        <Typography sx={{ color: "var(--text-light)", mt: 1 }}>
          Live organization-wide workforce metrics, hiring trends, and engagement insights.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ mb: 4 }}>
        <KPICards data={kpiData} />
      </Box>

      {/* Charts Row 1 */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mb: 3 }}>
        <RoleChart data={headcountData} />
        <DepartmentChart data={workModeData} />
      </Box>

      {/* Hiring Trend */}
      <Box sx={{ mb: 3 }}>
        <EmployeeTrendChart data={attritionTrend} />
      </Box>
    </Box>
  );
};

export default HRAnalytics;