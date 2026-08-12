import { Box, Grid } from "@mui/material";

import WelcomeBanner from "../components/WelcomeBanner";
import ActionCenter from "../components/ActionCenter";
import TeamHealthCard from "../components/TeamHealthCard";
import ActivityFeed from "../components/ActivityFeed";
import TopPerformers from "../components/TopPerformers";

import KPICards from "../../features/kpi/components/KPICards";
import type { KPIItem } from "../../features/kpi/components/KPICards/KPICards";
import QuickOverview from "../../features/dashboard/components/QuickOverview/QuickOverview";

import EmployeeTrendChart from "../../features/charts/components/EmployeeTrendChart";
import StatusChart from "../../features/charts/components/StatusChart";
import RiskChart from "../../features/charts/components/RiskChart";
import DepartmentChart from "../../features/charts/components/DepartmentChart";
import type { TrendChartData, DepartmentChartData, StatusChartData, RiskChartData } from "../../types/chart";
import "./ManagerDashboard.css";

const kpiData: KPIItem[] = [
  { id: "activeEmployees", title: "Team Members", value: "48", trend: 2 },
  { id: "attendanceRate", title: "Present Today", value: "44", trend: 4 },
  { id: "hiringRate", title: "Pending Leaves", value: "5", trend: -1 },
  { id: "performanceScore", title: "Performance", value: "92%", trend: 8 },
  { id: "highRiskEmployees", title: "High Risk", value: "3", trend: -2 },
  { id: "trainingCompletion", title: "Goals Achieved", value: "88%", trend: 6 },
];

const quickData = {
  totalEmployees: 48,
  presentToday: 44,
  pendingLeaves: 5,
  performanceScore: 92,
};

const trendData: TrendChartData[] = [
  { month: "Jan", totalEmployees: 78, activeEmployees: 78, newHires: 0, attrition: 0 },
  { month: "Feb", totalEmployees: 81, activeEmployees: 81, newHires: 3, attrition: 0 },
  { month: "Mar", totalEmployees: 84, activeEmployees: 84, newHires: 3, attrition: 0 },
  { month: "Apr", totalEmployees: 82, activeEmployees: 82, newHires: 0, attrition: 2 },
  { month: "May", totalEmployees: 87, activeEmployees: 87, newHires: 5, attrition: 0 },
  { month: "Jun", totalEmployees: 90, activeEmployees: 90, newHires: 3, attrition: 0 },
];

const riskData: RiskChartData[] = [
  { id: "r1", risk: "Low", employees: 35, percentage: 73 },
  { id: "r2", risk: "Medium", employees: 10, percentage: 21 },
  { id: "r3", risk: "High", employees: 3, percentage: 6 },
];

const statusData: StatusChartData[] = [
  { id: "s1", status: "Present", employees: 44, percentage: 92 },
  { id: "s2", status: "Absent", employees: 2, percentage: 4 },
  { id: "s3", status: "Leave", employees: 2, percentage: 4 },
];

const leaveData: DepartmentChartData[] = [
  { id: "l1", name: "Sick", value: 40, activeEmployees: 38, inactiveEmployees: 2, averageSalary: 80000, averageExperience: 5, performanceScore: 85, trainingCompletion: 90 },
  { id: "l2", name: "Vacation", value: 20, activeEmployees: 19, inactiveEmployees: 1, averageSalary: 60000, averageExperience: 4, performanceScore: 80, trainingCompletion: 85 },
  { id: "l3", name: "Maternity", value: 25, activeEmployees: 23, inactiveEmployees: 2, averageSalary: 70000, averageExperience: 6, performanceScore: 88, trainingCompletion: 95 },
  { id: "l4", name: "Other", value: 15, activeEmployees: 15, inactiveEmployees: 0, averageSalary: 75000, averageExperience: 7, performanceScore: 90, trainingCompletion: 100 },
];


const ManagerDashboard = () => {
  return (
    <Box className="manager-dashboard">
      <WelcomeBanner />

      <Box className="dashboard-section" sx={{ my: 3 }}>
        <KPICards data={kpiData}>
           <Grid size={{ xs: 12, lg: 6, xl: 6 }}>
              <QuickOverview data={quickData} />
           </Grid>
        </KPICards>
      </Box>

      <Grid container spacing={3} className="dashboard-grid">
        <Grid size={{ xs: 12, lg: 7 }}>
          <ActionCenter />
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <TeamHealthCard />
        </Grid>
      </Grid>

      <Grid container spacing={3} className="dashboard-grid">
        <Grid size={{ xs: 12, lg: 6 }}>
          <EmployeeTrendChart data={trendData} />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <StatusChart data={statusData} />
        </Grid>
      </Grid>

      <Grid container spacing={3} className="dashboard-grid">
        <Grid size={{ xs: 12, lg: 6 }}>
          <RiskChart data={riskData} />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <DepartmentChart data={leaveData} />
        </Grid>
      </Grid>

      <Grid container spacing={3} className="dashboard-grid">
        <Grid size={{ xs: 12, lg: 7 }}>
          <ActivityFeed />
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <TopPerformers />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManagerDashboard;