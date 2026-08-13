import { Box, Typography, Paper, Divider, LinearProgress } from "@mui/material";
import { Analytics as AnalyticsIcon } from "@mui/icons-material";
import KPICards from "../../features/kpi/components/KPICards";
import EmployeeTrendChart from "../../features/charts/components/EmployeeTrendChart";
import RoleChart from "../../features/charts/components/RoleChart";
import DepartmentChart from "../../features/charts/components/DepartmentChart";
import type { TrendChartData, DepartmentChartData } from "../../types/chart";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees, selectRestrictedDashboardEmployees } from "../../redux/dashboardSlice";
import type { AppDispatch } from "../../redux/store";

const genderData: DepartmentChartData[] = [
  { id: "1", name: "Male", value: 58, activeEmployees: 0, inactiveEmployees: 0, averageSalary: 0, averageExperience: 0, performanceScore: 0, trainingCompletion: 0 },
  { id: "2", name: "Female", value: 38, activeEmployees: 0, inactiveEmployees: 0, averageSalary: 0, averageExperience: 0, performanceScore: 0, trainingCompletion: 0 },
  { id: "3", name: "Other", value: 4, activeEmployees: 0, inactiveEmployees: 0, averageSalary: 0, averageExperience: 0, performanceScore: 0, trainingCompletion: 0 },
];

const retentionTargets = [
  { department: "Engineering", current: 96.8, target: 95 },
  { department: "Human Resources", current: 98.2, target: 97 },
  { department: "Sales", current: 94.3, target: 95 },
  { department: "Finance", current: 97.6, target: 96 },
  { department: "Marketing", current: 96.2, target: 95 },
  { department: "Operations", current: 97.1, target: 96 },
];

const attritionTrend: TrendChartData[] = [
  { month: "Jan", activeEmployees: 780, totalEmployees: 800, newHires: 15, attrition: 2.1 },
  { month: "Feb", activeEmployees: 785, totalEmployees: 805, newHires: 10, attrition: 1.9 },
  { month: "Mar", activeEmployees: 790, totalEmployees: 812, newHires: 12, attrition: 2.4 },
  { month: "Apr", activeEmployees: 802, totalEmployees: 825, newHires: 18, attrition: 1.7 },
  { month: "May", activeEmployees: 810, totalEmployees: 830, newHires: 12, attrition: 2.0 },
  { month: "Jun", activeEmployees: 815, totalEmployees: 840, newHires: 15, attrition: 1.5 },
  { month: "Jul", activeEmployees: 822, totalEmployees: 848, newHires: 14, attrition: 1.8 },
  { month: "Aug", activeEmployees: 828, totalEmployees: 855, newHires: 12, attrition: 1.5 },
  { month: "Sep", activeEmployees: 835, totalEmployees: 862, newHires: 11, attrition: 1.7 },
  { month: "Oct", activeEmployees: 842, totalEmployees: 870, newHires: 14, attrition: 1.6 },
  { month: "Nov", activeEmployees: 850, totalEmployees: 880, newHires: 15, attrition: 1.3 },
  { month: "Dec", activeEmployees: 858, totalEmployees: 890, newHires: 12, attrition: 1.5 },
];

const HRAnalytics = () => {
  const dispatch = useDispatch<AppDispatch>();
  const employees = useSelector(selectRestrictedDashboardEmployees);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const { headcountData, kpiData } = useMemo(() => {
    const deptCounts: Record<string, number> = {};
    employees.forEach(emp => {
      const dept = typeof emp.department === 'object' ? emp.department.name : emp.department;
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    const headcountData = Object.entries(deptCounts).map(([dept, count], idx) => ({
      id: String(idx),
      role: dept,
      employees: count,
      averageSalary: 0,
      averageExperience: 0,
    }));

    const kpiData: any[] = [
      { id: "totalEmployees", title: "Total Headcount", value: employees.length.toLocaleString(), trend: 0 },
      { id: "trainingCompletion", title: "Avg Retention Rate", value: "95.8%", trend: 0 },
      { id: "performanceScore", title: "Avg Performance Score", value: "85%", trend: 0 },
      { id: "engagementScore", title: "Avg Engagement Score", value: "82%", trend: 0 },
    ];
    
    return { headcountData, kpiData };
  }, [employees]);
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: "var(--text-h)", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
          <AnalyticsIcon fontSize="large" sx={{ color: "var(--primary)" }} /> HR Analytics
        </Typography>
        <Typography sx={{ color: "var(--text-light)", mt: 1 }}>
          Organization-wide workforce metrics, attrition trends, and engagement insights.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ mb: 4 }}>
        <KPICards data={kpiData} />
      </Box>

      {/* Charts Row 1 */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mb: 3 }}>
        <RoleChart data={headcountData} />
        <DepartmentChart data={genderData} />
      </Box>

      {/* Attrition Trend */}
      <Box sx={{ mb: 3 }}>
        <EmployeeTrendChart data={attritionTrend} />
      </Box>

      {/* Retention Targets */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
        <Typography sx={{ color: "var(--text-h)", fontWeight: 700, mb: 3 }}>Retention Targets by Department</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {retentionTargets.map((r) => (
            <Box key={r.department}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ color: "var(--text-h)", fontSize: 14, fontWeight: 500 }}>{r.department}</Typography>
                <Typography sx={{ fontSize: 13 }}>
                  <span style={{ color: r.current >= r.target ? "#16A34A" : "#DC2626", fontWeight: 700 }}>{r.current}%</span>
                  <span style={{ color: "var(--text-light)" }}> / target {r.target}%</span>
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={r.current}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "var(--hover)",
                  "& .MuiLinearProgress-bar": { bgcolor: r.current >= r.target ? "#16A34A" : "#DC2626", borderRadius: 4 },
                }}
              />
              <Divider sx={{ borderColor: "var(--border)", mt: 1.5 }} />
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default HRAnalytics;