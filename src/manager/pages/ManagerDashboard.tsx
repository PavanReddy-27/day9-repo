import { useEffect, useMemo, useState } from "react";
import { Box, Grid, Paper, Typography, CircularProgress, Avatar, Chip } from "@mui/material";
import { Groups, CheckCircle, BeachAccess, TrendingUp, Warning, EventAvailable } from "@mui/icons-material";

import { useAppSelector } from "../../hooks/redux";
import { apiClient } from "../../services/apiClient";
import { attendanceApi } from "../../services/attendanceApi";

import StatusChart from "../../features/charts/components/StatusChart";
import RiskChart from "../../features/charts/components/RiskChart";
import DepartmentChart from "../../features/charts/components/DepartmentChart";
import type { DepartmentChartData, StatusChartData, RiskChartData } from "../../types/chart";
import "./ManagerDashboard.css";

interface EmployeeRow {
  _id: string;
  employeeId: string;
  fullName: string;
  designation?: string;
  role: string;
  riskLevel?: string;
  employmentStatus?: string;
  departmentName?: string;
  workMode?: string;
}

interface AttendanceRow {
  employeeId: string;
  checkedIn?: boolean;
  attendanceState?: string;
}

const pct = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

const ManagerDashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Scope the dashboard to the manager's own department (their team).
        const deptId = (user as { departmentId?: string } | null)?.departmentId;
        const empUrl = deptId ? `/employees?limit=500&departmentId=${deptId}` : "/employees?limit=500";
        const [emps, att] = await Promise.all([
          apiClient<EmployeeRow[]>(empUrl),
          attendanceApi.getGlobalAttendance(),
        ]);
        if (!active) return;
        const empList = Array.isArray(emps) ? emps : [];
        setEmployees(empList);
        // Keep only attendance rows for this manager's team.
        const teamIds = new Set(empList.map((e) => e.employeeId));
        const attList = (Array.isArray(att) ? (att as unknown as AttendanceRow[]) : []).filter(
          (a) => teamIds.has(a.employeeId)
        );
        setAttendance(attList);
      } catch {
        if (active) setError("Unable to load team data from the server.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const onUpdate = () => load();
    window.addEventListener("attendance_updated", onUpdate);
    return () => {
      active = false;
      window.removeEventListener("attendance_updated", onUpdate);
    };
  }, [user]);

  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.employmentStatus === "Active").length;
    const onLeave = employees.filter((e) => e.employmentStatus === "On Leave").length;
    const highRisk = employees.filter((e) => e.riskLevel === "High" || e.riskLevel === "Critical").length;
    const presentToday = attendance.filter((a) => a.checkedIn).length;
    const attendanceRate = pct(presentToday, total || attendance.length);
    return { total, active, onLeave, highRisk, presentToday, attendanceRate };
  }, [employees, attendance]);

  const statusData: StatusChartData[] = useMemo(() => {
    const present = stats.presentToday;
    const absent = Math.max(0, stats.total - present);
    return [
      { id: "s1", status: "Present", employees: present, percentage: pct(present, stats.total) },
      { id: "s2", status: "Absent", employees: absent, percentage: pct(absent, stats.total) },
    ];
  }, [stats]);

  const riskData: RiskChartData[] = useMemo(() => {
    const levels = ["Low", "Medium", "High", "Critical"];
    return levels
      .map((risk, i) => {
        const employeesCount = employees.filter((e) => (e.riskLevel || "Low") === risk).length;
        return { id: `r${i}`, risk, employees: employeesCount, percentage: pct(employeesCount, employees.length) };
      })
      .filter((r) => r.employees > 0);
  }, [employees]);

  const roleData: DepartmentChartData[] = useMemo(() => {
    const byRole: Record<string, number> = {};
    employees.forEach((e) => {
      const key = e.designation || e.role || "Unknown";
      byRole[key] = (byRole[key] || 0) + 1;
    });
    return Object.entries(byRole)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value], i) => ({
        id: `role${i}`,
        name,
        value,
        activeEmployees: value,
        inactiveEmployees: 0,
        averageSalary: 0,
        averageExperience: 0,
        performanceScore: 0,
        trainingCompletion: 0,
      }));
  }, [employees]);

  const checkedInList = useMemo(
    () => attendance.filter((a) => a.checkedIn).map((a) => a.employeeId),
    [attendance]
  );

  const kpiCards = [
    { label: "Team Members", value: stats.total, icon: Groups, color: "#4F46E5" },
    { label: "Present Today", value: stats.presentToday, icon: CheckCircle, color: "#16A34A" },
    { label: "Attendance Rate", value: `${stats.attendanceRate}%`, icon: EventAvailable, color: "#2563EB" },
    { label: "On Leave", value: stats.onLeave, icon: BeachAccess, color: "#D97706" },
    { label: "Active", value: stats.active, icon: TrendingUp, color: "#0891B2" },
    { label: "High Risk", value: stats.highRisk, icon: Warning, color: "#DC2626" },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="manager-dashboard" sx={{ p: { xs: 2, md: 3 } }}>
      {/* Real welcome header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--text-h)" }}>
          Welcome back, {user?.fullName || "Manager"} 👋
        </Typography>
        <Typography sx={{ color: "var(--text-light)", mt: 0.5 }}>
          {user?.department || "Your"} department · {stats.total} team members ·{" "}
          {stats.presentToday} present today ({stats.attendanceRate}%)
        </Typography>
      </Paper>

      {error && (
        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: "1px solid #DC2626", color: "#DC2626" }}>
          {error}
        </Paper>
      )}

      {/* Real KPI tiles */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 2, mb: 3 }}>
        {kpiCards.map((c) => {
          const Icon = c.icon;
          return (
            <Paper key={c.label} elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Icon sx={{ color: c.color }} fontSize="small" />
                <Typography sx={{ color: "var(--text-light)", fontSize: 13 }}>{c.label}</Typography>
              </Box>
              <Typography sx={{ fontSize: 32, fontWeight: 800, color: "var(--text-h)" }}>{c.value}</Typography>
            </Paper>
          );
        })}
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <StatusChart data={statusData} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <RiskChart data={riskData} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <DepartmentChart data={roleData} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)", height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--text-h)", mb: 2 }}>
              Team Roster ({stats.total})
            </Typography>
            <Box sx={{ maxHeight: 340, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
              {employees.length === 0 && (
                <Typography sx={{ color: "var(--text-light)" }}>No team members found.</Typography>
              )}
              {employees.slice(0, 30).map((e) => {
                const isIn = checkedInList.includes(e.employeeId);
                return (
                  <Box key={e._id} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.75, borderBottom: "1px solid var(--border)" }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: "var(--primary)" }}>
                      {e.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "var(--text-h)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {e.fullName}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "var(--text-light)" }}>
                        {e.employeeId} · {e.designation || e.role}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={isIn ? "In" : "Out"}
                      sx={{ bgcolor: isIn ? "#16A34A22" : "#64748B22", color: isIn ? "#16A34A" : "#64748B", fontWeight: 700 }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManagerDashboard;
