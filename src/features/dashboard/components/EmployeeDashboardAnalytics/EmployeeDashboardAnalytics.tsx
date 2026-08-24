import { useEffect, useState, useMemo } from "react";
import { Box, Typography, Grid, Divider, CircularProgress, Chip, Stack } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from "recharts";

import KPICards from "../../../kpi/components/KPICards";
import type { KPIItem } from "../../../kpi/components/KPICards";

import {
  getAttendanceAnalytics,
  getPerformanceAnalytics,
  getProductivityAnalytics,
  getSkillsAnalytics,
} from "../../../../services/analyticsService";

import "./EmployeeDashboardAnalytics.css";

const EmployeeDashboardAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [productivityData, setProductivityData] = useState<any>(null);
  const [skillsData, setSkillsData] = useState<any>(null);

  useEffect(() => {
    const fetchPersonalData = async () => {
      setLoading(true);
      try {
        const [attRes, perfRes, prodRes, skillsRes] = await Promise.all([
          getAttendanceAnalytics(),
          getPerformanceAnalytics(),
          getProductivityAnalytics(),
          getSkillsAnalytics()
        ]);
        setAttendanceData(attRes);
        setPerformanceData(perfRes || []);
        setProductivityData(prodRes);
        setSkillsData(skillsRes);
        
        const now = new Date();
        setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (error) {
        console.error("Failed to fetch personal analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalData();
  }, []);

  const kpis = useMemo<KPIItem[]>(() => {
    if (loading || !attendanceData || !productivityData) return [];

    const summary = attendanceData.summary || [];
    const trends = attendanceData.trends || [];
    
    // Attendance Rate (last 7 days average)
    let avgAttendance = 0;
    if (trends.length > 0) {
      avgAttendance = trends.reduce((acc: number, t: any) => acc + t.attendanceRate, 0) / trends.length;
    }

    // Productivity
    const prodScore = productivityData.avgProductivityScore || 0;
    const tasksCompleted = productivityData.totalTasksCompleted || 0;
    
    // Performance
    let latestPerf = null;
    if (performanceData && performanceData.length > 0) {
      latestPerf = performanceData[performanceData.length - 1];
    }
    const avgRating = latestPerf?.avgRating || 0;
    const completedGoals = latestPerf?.completedGoals || 0;

    // Skills
    const skillCoverage = skillsData?.coveragePercentage || 0;

    const avgFocusScore = productivityData.avgFocusScore || 0;
    const avgActiveHours = productivityData.avgActiveHours || 0;

    return [
      {
        id: "attendanceRate",
        title: "Attendance Rate",
        value: `${Math.round(avgAttendance)}%`,
        trend: 0,
        subtitle: "Last 7 days",
        progress: avgAttendance,
      },
      {
        id: "productivityScore",
        title: "Productivity",
        value: `${prodScore}%`,
        trend: 0,
        subtitle: "Efficiency Score",
        progress: prodScore,
      },
      {
        id: "focusScore",
        title: "Focus Score",
        value: `${avgFocusScore}%`,
        trend: 0,
        subtitle: "Deep Work %",
        progress: avgFocusScore,
      },
      {
        id: "activeHours",
        title: "Active Hours",
        value: `${avgActiveHours}h`,
        trend: 0,
        subtitle: "Avg per day",
        progress: (avgActiveHours / 8) * 100, // Assuming 8 is 100%
      },
      {
        id: "performanceRating",
        title: "Latest Rating",
        value: avgRating.toString(),
        trend: 0,
        subtitle: "Out of 5.0",
        progress: (avgRating / 5) * 100,
      },
      {
        id: "tasksCompleted",
        title: "Tasks Finished",
        value: tasksCompleted,
        trend: 0,
        subtitle: "Last 30 days",
        progress: 100,
      },
      {
        id: "goalsAchieved",
        title: "Goals Achieved",
        value: completedGoals,
        trend: 0,
        subtitle: "Recent review period",
        progress: 100,
      },
      {
        id: "skillCoverage",
        title: "Skill Coverage",
        value: `${skillCoverage}%`,
        trend: 0,
        subtitle: "Role required skills",
        progress: skillCoverage,
      }
    ];
  }, [attendanceData, performanceData, productivityData, skillsData, loading]);

  if (loading && !attendanceData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const attendanceTrends = attendanceData?.trends || [];

  return (
    <Box className="employee-dashboard">
      <Box className="employee-dashboard__header">
        <Box>
          <Typography variant="h4">My Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Personal performance, attendance, and productivity insights.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Chip color="success" icon={<AccessTimeIcon />} label={`Updated ${lastUpdated}`} />
          </Stack>
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      <KPICards data={kpis} loading={loading} />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box className="chart-card">
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Attendance History</Typography>
            <Box className="chart-container">
              {attendanceTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceTrends} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="var(--text-light)" 
                      fontSize={12} 
                      tickFormatter={(val) => {
                        const date = new Date(val);
                        return isNaN(date.getTime()) ? val : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                      }}
                    />
                    <YAxis stroke="var(--text-light)" fontSize={12} domain={[0, 1]} ticks={[0, 1]} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: 8, color: 'var(--text)' }}
                      itemStyle={{ color: 'var(--text)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    <Bar dataKey="present" name="Present Days" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="late" name="Late Days" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary">No attendance data available.</Typography>
              )}
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box className="chart-card">
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Performance Rating Trend</Typography>
            <Box className="chart-container">
              {performanceData && performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--text-light)" fontSize={12} />
                    <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} stroke="var(--text-light)" fontSize={12} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: 8, color: 'var(--text)' }}
                      itemStyle={{ color: 'var(--text)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    <Line type="monotone" dataKey="avgRating" name="Rating" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary">No performance reviews available yet.</Typography>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDashboardAnalytics;
