import { Box, Typography, CircularProgress } from "@mui/material";

import KPICards from "../../features/kpi/components/KPICards";
import EmployeeTrendChart from "../../features/charts/components/EmployeeTrendChart";
import RoleChart from "../../features/charts/components/RoleChart";
import RiskChart from "../../features/charts/components/RiskChart";
import type { TrendChartData, RiskChartData, RoleChartData } from "../../types/chart";

import "./Analytics.css";
import { useEffect, useState } from "react";
import {
  getWorkforceAnalytics,
  getAttendanceAnalytics,
  subscribeToAnalytics,
  WorkforceAnalyticsResponse,
  AttendanceAnalyticsResponse
} from "../../services/analyticsService";

const ManagerAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [workforceData, setWorkforceData] = useState<WorkforceAnalyticsResponse | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceAnalyticsResponse | null>(null);
  const fetchData = async () => {
    try {
      const [wfRes, attRes] = await Promise.all([
        getWorkforceAnalytics(),
        getAttendanceAnalytics(),
      ]);
      setWorkforceData(wfRes);
      setAttendanceData(attRes);
    } catch (e) {
      console.error("Failed to fetch manager analytics", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = subscribeToAnalytics(() => {
      fetchData();
    });
    return unsubscribe;
  }, []);

  if (loading || !workforceData) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress />
      </Box>
    );
  }

  const kpiData = [
    { id: "totalEmployees" as const, title: "Department Size", value: workforceData.totalEmployees.toLocaleString(), trend: 0 },
    { id: "activeEmployees" as const, title: "Active Today", value: workforceData.activeEmployees.toLocaleString(), trend: 0 },
    { id: "inactiveEmployees" as const, title: "On Leave", value: (workforceData.statusDistribution.find(s => s.name === "On Leave")?.value || 0).toLocaleString(), trend: 0 },
    { id: "attendanceRate" as const, title: "Attendance Rate", value: `${Math.round(((workforceData.activeEmployees || 0) / (workforceData.totalEmployees || 1)) * 100)}%`, trend: 2, subtitle: "Present today" },
  ];

  // Map risk distribution to RiskChartData
  const riskData: RiskChartData[] = (workforceData.riskDistribution || []).map((item, idx) => ({
    id: String(idx),
    risk: item.name,
    employees: item.value,
    percentage: workforceData.totalEmployees ? (item.value / workforceData.totalEmployees) * 100 : 0
  }));

  // Map team structure to Work Mode distribution
  const teamStructureData: RoleChartData[] = (
    workforceData.workModeDistribution && workforceData.workModeDistribution.length > 0
      ? workforceData.workModeDistribution
      : [{ name: "Team Members", value: workforceData.totalEmployees }]
  ).map((item: any, idx: number) => ({
    id: String(idx),
    role: item.name,
    employees: item.value,
    averageSalary: 75000,
    averageExperience: 4,
  }));

  // Map real attendance trends
  const attendanceTrend: TrendChartData[] = (attendanceData?.trends || []).map((t) => ({
    month: t.date,
    activeEmployees: t.present,
    totalEmployees: t.total,
    newHires: 0,
    attrition: 0,
  }));

  return (
    <Box className="manager-analytics-container">
      <Typography variant="h4" className="analytics-title">
        Department Analytics
      </Typography>

      <Box className="kpi-section">
        <KPICards data={kpiData} />
      </Box>

      <Box className="charts-grid">
        <Box className="chart-card">
          <RoleChart
            data={teamStructureData}
            title="Work Mode Breakdown"
            subtitle="Office, Remote, and Hybrid team presence"
          />
        </Box>
        <Box className="chart-card">
          <RiskChart data={riskData} />
        </Box>
      </Box>

      <Box className="trend-section">
        <EmployeeTrendChart
          data={attendanceTrend}
          title="Attendance Trends"
          subtitle="Daily team attendance vs. scheduled total"
        />
      </Box>
    </Box>
  );
};

export default ManagerAnalytics;