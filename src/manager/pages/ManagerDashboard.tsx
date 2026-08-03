
import { Box, Grid } from "@mui/material";

import WelcomeBanner from "../components/WelcomeBanner";
import ManagerKPICards from "../components/ManagerKPICards";
import ActionCenter from "../components/ActionCenter";
import TeamHealthCard from "../components/TeamHealthCard";
import ActivityFeed from "../components/ActivityFeed";
import TopPerformers from "../components/TopPerformers";

import PerformanceTrendChart from "../components/charts/PerformanceTrendChart";
import AttendanceChart from "../components/charts/AttendanceChart";
import RiskDistributionChart from "../components/charts/RiskDistributionChart";
import LeaveOverviewChart from "../components/charts/LeaveOverviewChart";

import "./ManagerDashboard.css";

const ManagerDashboard = () => {
  return (
    <Box className="manager-dashboard">
      <WelcomeBanner />

      <Box className="dashboard-section">
        <ManagerKPICards />
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
          <PerformanceTrendChart />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <AttendanceChart />
        </Grid>
      </Grid>

      <Grid container spacing={3} className="dashboard-grid">
        <Grid size={{ xs: 12, lg: 6 }}>
          <RiskDistributionChart />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <LeaveOverviewChart />
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