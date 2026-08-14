import { Box, Typography } from "@mui/material";

import KPICards from "../../features/kpi/components/KPICards";
import type { KPIItem } from "../../features/kpi/components/KPICards/KPICards";
import EmployeeTrendChart from "../../features/charts/components/EmployeeTrendChart";
import RoleChart from "../../features/charts/components/RoleChart";
import RiskChart from "../../features/charts/components/RiskChart";
import type { TrendChartData, RoleChartData, RiskChartData } from "../../types/chart";

import "./Analytics.css";

const departmentData: RoleChartData[] = [
  { id: "1", role: "Engineering", employees: 28, averageSalary: 0, averageExperience: 0 },
  { id: "2", role: "QA", employees: 8, averageSalary: 0, averageExperience: 0 },
  { id: "3", role: "Design", employees: 6, averageSalary: 0, averageExperience: 0 },
  { id: "4", role: "Support", employees: 4, averageSalary: 0, averageExperience: 0 },
];

const attendanceTrend: TrendChartData[] = [
  { month: "Jan", activeEmployees: 91, totalEmployees: 100, newHires: 0, attrition: 0 },
  { month: "Feb", activeEmployees: 93, totalEmployees: 100, newHires: 0, attrition: 0 },
  { month: "Mar", activeEmployees: 92, totalEmployees: 100, newHires: 0, attrition: 0 },
  { month: "Apr", activeEmployees: 95, totalEmployees: 100, newHires: 0, attrition: 0 },
  { month: "May", activeEmployees: 96, totalEmployees: 100, newHires: 0, attrition: 0 },
  { month: "Jun", activeEmployees: 94, totalEmployees: 100, newHires: 0, attrition: 0 },
];

const riskData: RiskChartData[] = [
  { id: "r1", risk: "Low", employees: 35, percentage: 73, color: "var(--success)" },
  { id: "r2", risk: "Medium", employees: 9, percentage: 19, color: "var(--warning)" },
  { id: "r3", risk: "High", employees: 4, percentage: 8, color: "var(--error)" },
];

const kpiData: KPIItem[] = [
  { id: "activeEmployees", title: "Team Members", value: "46", trend: 0 },
  { id: "attendanceRate", title: "Attendance", value: "94%", trend: 0 },
  { id: "performanceScore", title: "Avg Productivity", value: "91%", trend: 0 },
  { id: "highRiskEmployees", title: "High Risk", value: "4", trend: 0 },
];

const Analytics = () => {
  return (
    <Box className="analytics-page">
      <Typography
        variant="h4"
        className="analytics-title"
      >
        📊 Manager Analytics
      </Typography>

      <Box sx={{ mb: 4 }}>
        <KPICards data={kpiData} />
      </Box>

      <div className="analytics-chart-grid">
        <RoleChart data={departmentData} />
        <EmployeeTrendChart data={attendanceTrend} />
        <RiskChart data={riskData} />
      </div>
    </Box>
  );
};

export default Analytics;