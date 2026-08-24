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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  ];

  // Map risk distribution to RiskChartData
  const riskData: RiskChartData[] = (workforceData.riskDistribution || []).map((item, idx) => ({
    id: String(idx),
    risk: item.name,
    employees: item.value,
    percentage: workforceData.totalEmployees ? (item.value / workforceData.totalEmployees) * 100 : 0
  }));

  // Map real department data (Currently Manager doesn't have a distinct sub-department breakdown unless returned from a specific endpoint, so we show the department total)
  const departmentData: RoleChartData[] = [
    { id: "1", role: "Your Department", employees: workforceData.totalEmployees, averageSalary: 0, averageExperience: 0 },
  ];

  // Map real attendance trends
  const attendanceTrend: TrendChartData[] = (attendanceData?.trends || []).map((t) => ({
    month: t.date,
    activeEmployees: t.present,
    totalEmployees: t.total,
    newHires: 0,
    attrition: 0
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
          <Typography variant="h6" className="chart-title">Team Structure</Typography>
          <RoleChart data={departmentData} />
        </Box>
        <Box className="chart-card">
          <Typography variant="h6" className="chart-title">Flight Risk Analysis</Typography>
          <RiskChart data={riskData} />
        </Box>
      </Box>

      <Box className="trend-section">
        <Typography variant="h6" className="chart-title">Attendance Trends</Typography>
        <EmployeeTrendChart data={attendanceTrend} />
      </Box>
    </Box>
  );
};

export default ManagerAnalytics;