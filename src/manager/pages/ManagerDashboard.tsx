import { useState, useEffect } from "react";
import { Box, Grid } from "@mui/material";
import { motion, Variants } from "framer-motion";

import WelcomeBanner from "../components/WelcomeBanner";
import ActionCenter from "../components/ActionCenter";
import TeamHealthCard from "../components/TeamHealthCard";
import ActivityFeed from "../components/ActivityFeed";
import TopPerformers from "../components/TopPerformers";

import KPICards from "../../features/kpi/components/KPICards";
import type { KPIItem } from "../../features/kpi/components/KPICards/KPICards";
import QuickOverview from "../../features/dashboard/components/QuickOverview/QuickOverview";

import { LineChart, BarChart, PieChart, DonutChart } from "../../components/charts";
import { getWorkforceAnalytics, getAttendanceAnalytics, getPerformanceAnalytics, getSkillAnalytics } from "../../api/clients/analyticsApi";

import "./ManagerDashboard.css";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

import { useNavigate } from "react-router-dom";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [workforceData, setWorkforceData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [skillData, setSkillData] = useState<any>(null);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [workforce, attendance, performance, skills] = await Promise.all([
        getWorkforceAnalytics(),
        getAttendanceAnalytics(),
        getPerformanceAnalytics(),
        getSkillAnalytics()
      ]);
      setWorkforceData(workforce);
      setAttendanceData(attendance);
      setPerformanceData(performance);
      setSkillData(skills);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAnalytics();
  }, []);

  const attendanceRate = attendanceData?.trends?.length > 0
    ? attendanceData.trends[attendanceData.trends.length - 1]?.attendanceRate || 0
    : 0;

  const kpiData: KPIItem[] = [
    { id: "activeEmployees", title: "Team Members", value: workforceData?.totalEmployees || 0, trend: 2 },
    { id: "attendanceRate", title: "Attendance", value: `${attendanceRate}%`, trend: 4 },
    { id: "performanceScore", title: "Performance", value: performanceData?.length > 0 ? `${performanceData[performanceData.length - 1]?.avgRating} / 5` : "N/A", trend: 8 },
    { id: "trainingCompletion", title: "Skills Coverage", value: `${skillData?.coveragePercentage || 0}%`, trend: 6 },
  ];

  const quickData = {
    totalEmployees: workforceData?.totalEmployees || 0,
    presentToday: attendanceData?.trends?.length > 0 ? attendanceData.trends[attendanceData.trends.length - 1]?.present || 0 : 0,
    pendingLeaves: 5,
    performanceScore: 92,
  };

  const riskData = workforceData?.riskDistribution?.map((r: any) => ({
    name: r.name,
    value: r.value,
  })) || [];

  const statusData = workforceData?.statusDistribution?.map((s: any) => ({
    name: s.name,
    value: s.value,
  })) || [];

  const skillsChartData = skillData?.skills?.map((s: any) => ({
    name: s.name,
    value: s.count,
  })) || [];

  return (
    <motion.div 
      className="manager-dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}
    >
      <motion.div variants={itemVariants}>
        <WelcomeBanner />
      </motion.div>

      <motion.div variants={itemVariants} className="dashboard-section" style={{ marginTop: '24px', marginBottom: '24px' }}>
        <KPICards data={kpiData}>
           <Grid size={{ xs: 12, lg: 6, xl: 6 }}>
              <QuickOverview data={quickData} onViewReport={() => navigate('/manager/analytics')} />
           </Grid>
        </KPICards>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Grid container spacing={3} className="dashboard-grid">
          <Grid size={{ xs: 12, lg: 7 }}>
            <ActionCenter />
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <TeamHealthCard />
          </Grid>
        </Grid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Grid container spacing={3} className="dashboard-grid" sx={{ mt: 3 }}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ height: 400 }}>
              <LineChart
                title="Team Performance Trends"
                data={performanceData}
                xAxisKey="month"
                series={[{ dataKey: "avgRating", name: "Avg Rating", color: "var(--primary)" }]}
                loading={loading}
                error={error || undefined}
                onRefresh={loadAnalytics}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ height: 400 }}>
              <PieChart
                title="Employment Status"
                data={statusData}
                loading={loading}
                error={error || undefined}
                onRefresh={loadAnalytics}
              />
            </Box>
          </Grid>
        </Grid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Grid container spacing={3} className="dashboard-grid" sx={{ mt: 3 }}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ height: 400 }}>
              <DonutChart
                title="Team Risk Distribution"
                data={riskData}
                loading={loading}
                error={error || undefined}
                onRefresh={loadAnalytics}
                centerLabel="Risk Levels"
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ height: 400 }}>
              <BarChart
                title="Team Skills"
                data={skillsChartData}
                xAxisKey="name"
                series={[{ dataKey: "value", name: "Employees with Skill", color: "var(--secondary)" }]}
                loading={loading}
                error={error || undefined}
                onRefresh={loadAnalytics}
              />
            </Box>
          </Grid>
        </Grid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Grid container spacing={3} className="dashboard-grid" sx={{ mt: 3 }}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <ActivityFeed />
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <TopPerformers />
          </Grid>
        </Grid>
      </motion.div>
    </motion.div>
  );
};

export default ManagerDashboard;