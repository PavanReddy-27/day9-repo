import { useState, useEffect } from "react";
import { Grid } from "@mui/material";
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
import { getWorkforceAnalytics, getAttendanceAnalytics, getPerformanceAnalytics, getSkillAnalytics, getProductivityAnalytics } from "../../services/analyticsService";
import leaveApi from "../../services/leaveApi";

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
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [productivityData, setProductivityData] = useState<any>(null);

  const loadAnalytics = async () => {
    setError(null);
    try {
      const [workforce, attendance, performance, skills, leaves, productivity] = await Promise.all([
        getWorkforceAnalytics(),
        getAttendanceAnalytics(),
        getPerformanceAnalytics(),
        getSkillAnalytics(),
        leaveApi.getLeaves("Pending").catch(() => []),
        getProductivityAnalytics().catch(() => null),
      ]);
      setWorkforceData(workforce);
      setAttendanceData(attendance);
      setPerformanceData(performance || []);
      setSkillData(skills);
      setPendingLeaves(Array.isArray(leaves) ? leaves : []);
      setProductivityData(productivity);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const attendanceRate = attendanceData?.trends?.length > 0
    ? Math.round(attendanceData.trends[attendanceData.trends.length - 1]?.attendanceRate || 0)
    : 0;

  const perfScore = performanceData?.length > 0
    ? Math.round((Number(performanceData[performanceData.length - 1]?.avgRating) || 0) * 20)
    : 0;

  const prodScore = productivityData?.avgProductivityScore
    ? Math.round(productivityData.avgProductivityScore)
    : 0;

  const skillCoverage = skillData?.coveragePercentage || 0;

  const activeMetrics = [attendanceRate, perfScore, skillCoverage, prodScore].filter((m) => m > 0);
  const healthScore = activeMetrics.length > 0
    ? Math.round(activeMetrics.reduce((a, b) => a + b, 0) / activeMetrics.length)
    : 0;

  const kpiData: KPIItem[] = [
    { id: "activeEmployees", title: "Team Members", value: workforceData?.totalEmployees || 0, trend: 0 },
    { id: "attendanceRate", title: "Attendance", value: `${attendanceRate}%`, trend: 0 },
    { id: "performanceScore", title: "Performance", value: performanceData?.length > 0 ? `${performanceData[performanceData.length - 1]?.avgRating} / 5` : "N/A", trend: 0 },
    { id: "trainingCompletion", title: "Skills Coverage", value: `${skillCoverage}%`, trend: 0 },
  ];

  const quickData = {
    totalEmployees: workforceData?.totalEmployees || 0,
    presentToday: attendanceData?.trends?.length > 0 ? attendanceData.trends[attendanceData.trends.length - 1]?.present || 0 : 0,
    pendingLeaves: pendingLeaves.length,
    performanceScore: perfScore,
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
      style={{ width: '100%', margin: 0 }}
    >
      <motion.div variants={itemVariants}>
        <WelcomeBanner
          teamCount={workforceData?.totalEmployees || 0}
          pendingLeavesCount={pendingLeaves.length}
          healthScore={healthScore}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <KPICards data={kpiData} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <ActionCenter pendingLeavesCount={pendingLeaves.length} />
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <TeamHealthCard
              attendanceRate={attendanceRate}
              performanceScore={perfScore}
              productivityScore={prodScore}
              skillsCoverage={skillData?.coveragePercentage || 0}
              teamMembersCount={workforceData?.totalEmployees || 48}
              highRiskCount={riskData.find((r: any) => r.name === "High")?.value ?? 3}
            />
          </Grid>
        </Grid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <LineChart
              title="Team Performance Trends"
              data={performanceData}
              xAxisKey="month"
              series={[{ dataKey: "avgRating", name: "Avg Rating", color: "var(--primary)" }]}
              loading={loading}
              error={error || undefined}
              onRefresh={loadAnalytics}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <PieChart
              title="Employment Status"
              data={statusData}
              loading={loading}
              error={error || undefined}
              onRefresh={loadAnalytics}
            />
          </Grid>
        </Grid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <DonutChart
              title="Team Risk Distribution"
              data={riskData}
              loading={loading}
              error={error || undefined}
              onRefresh={loadAnalytics}
              centerLabel="Risk Levels"
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <BarChart
              title="Team Skills"
              data={skillsChartData}
              xAxisKey="name"
              series={[{ dataKey: "value", name: "Employees with Skill", color: "var(--secondary)" }]}
              loading={loading}
              error={error || undefined}
              onRefresh={loadAnalytics}
            />
          </Grid>
        </Grid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <QuickOverview data={quickData} onViewReport={() => navigate('/manager/analytics')} />
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <TopPerformers />
          </Grid>
        </Grid>
      </motion.div>

      <motion.div variants={itemVariants}>
        <ActivityFeed />
      </motion.div>
    </motion.div>
  );
};

export default ManagerDashboard;