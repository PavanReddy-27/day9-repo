import { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { TrendingUp, Search } from "@mui/icons-material";
import { apiClient } from "../../services/apiClient";
import { getWorkforceAnalytics } from "../../services/analyticsService";

interface EmployeePerformanceItem {
  id: string;
  employeeName: string;
  role: string;
  department: string;
  rating: number;
  performanceScore: number;
  productivity: number;
  performanceBand: string;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
}

const riskColors: Record<string, { bg: string; color: string }> = {
  Low: { bg: "#16A34A22", color: "#16A34A" },
  Medium: { bg: "#D9770622", color: "#D97706" },
  High: { bg: "#DC262622", color: "#DC2626" },
  Critical: { bg: "#DC262633", color: "#DC2626" },
};

const avatarColors = ["#2563EB", "#7C3AED", "#DB2777", "#D97706", "#16A34A", "#0891B2", "#DC2626", "#0891B2"];

const Performance = () => {
  const [employees, setEmployees] = useState<EmployeePerformanceItem[]>([]);
  const [totalWorkforceCount, setTotalWorkforceCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch authoritative headcount from MongoDB aggregation alongside employee performance records
      const [wfRes, data] = await Promise.all([
        getWorkforceAnalytics().catch(() => null),
        apiClient<any[]>("/employees?limit=200"),
      ]);

      if (wfRes?.totalEmployees) {
        setTotalWorkforceCount(wfRes.totalEmployees);
      }
      const mapped: EmployeePerformanceItem[] = (Array.isArray(data) ? data : []).map((emp: any) => {
        const perfScore = typeof emp.performanceScore === "number" ? emp.performanceScore : 0;
        const prodScore = typeof emp.productivity === "number" ? emp.productivity : 0;
        const rating = Number(((perfScore || 60) / 20).toFixed(1));
        const band =
          emp.performance ||
          (perfScore >= 85 ? "Excellent" : perfScore >= 70 ? "Good" : "Average");

        const deptName =
          emp.departmentName ||
          (typeof emp.departmentId === "object" ? emp.departmentId?.name : emp.department) ||
          "General";

        return {
          id: emp.employeeId || emp._id,
          employeeName: emp.fullName || emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
          role: emp.designation || emp.role || "Employee",
          department: deptName,
          rating,
          performanceScore: perfScore,
          productivity: prodScore,
          performanceBand: band,
          riskLevel: emp.riskLevel || "Low",
        };
      });
      setEmployees(mapped);
    } catch (err: any) {
      console.error("Failed to fetch performance records:", err);
      setError(err?.message || "Failed to load performance data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const depts = ["All", ...Array.from(new Set(employees.map((r) => r.department)))];

  const filtered = useMemo(() =>
    employees.filter((r) => {
      const q = search.toLowerCase();
      return (
        (r.employeeName.toLowerCase().includes(q) || r.role.toLowerCase().includes(q)) &&
        (riskFilter === "All" || r.riskLevel === riskFilter) &&
        (deptFilter === "All" || r.department === deptFilter)
      );
    }), [search, riskFilter, deptFilter, employees]);

  const avgRating = employees.length
    ? (employees.reduce((s, r) => s + r.rating, 0) / employees.length).toFixed(1)
    : "0.0";

  return (
    <Box sx={{ p: 0 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" sx={{ color: "var(--text-h)", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
          <TrendingUp fontSize="medium" sx={{ color: "var(--primary)" }} /> Performance & Risk Monitoring
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--text-light)", mt: 0.5 }}>
          Live workforce performance metrics, aggregated productivity, and risk indicators from MongoDB.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ py: 4 }}>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={fetchData}>
              Retry
            </Button>
          }>
            {error}
          </Alert>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 2, mb: 4 }}>
            {[
              { label: "Total Workforce", value: totalWorkforceCount || employees.length, color: "#2563EB" },
              { label: "Avg Rating", value: `${avgRating}/5`, color: "#16A34A" },
              { label: "High / Critical Risk", value: employees.filter((r) => r.riskLevel === "High" || r.riskLevel === "Critical").length, color: "#DC2626" },
              { label: "Low Risk", value: employees.filter((r) => r.riskLevel === "Low").length, color: "#16A34A" },
            ].map((s) => (
              <Paper key={s.label} elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
                <Typography sx={{ color: "var(--text-light)", fontSize: 13, mb: 1 }}>{s.label}</Typography>
                <Typography sx={{ color: s.color, fontSize: 30, fontWeight: 800 }}>{s.value}</Typography>
              </Paper>
            ))}
          </Box>

          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <TextField
              size="small" placeholder="Search employee or role..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1, minWidth: 220, bgcolor: "var(--surface)" }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: "var(--text-light)" }} /></InputAdornment> } }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Department</InputLabel>
              <Select label="Department" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} sx={{ bgcolor: "var(--surface)" }}>
                {depts.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Risk Level</InputLabel>
              <Select label="Risk Level" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} sx={{ bgcolor: "var(--surface)" }}>
                {["All", "Low", "Medium", "High", "Critical"].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
            <Table>
              <TableHead>
                <TableRow>
                  {["Employee", "Department", "Rating", "Performance Score", "Productivity %", "Attrition Risk", "Performance Band"].map((h) => (
                    <TableCell key={h} sx={{ color: "var(--text-light)", fontWeight: 600, borderColor: "var(--border)" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 4, color: "var(--text-light)" }}>
                      No performance records found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((rev, i) => (
                    <TableRow key={rev.id}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar sx={{ width: 34, height: 34, fontSize: 13, bgcolor: avatarColors[i % avatarColors.length] }}>
                            {rev.employeeName ? rev.employeeName[0] : "U"}
                          </Avatar>
                          <Box>
                            <Typography sx={{ color: "var(--text-h)", fontWeight: 600, fontSize: 14 }}>{rev.employeeName}</Typography>
                            <Typography sx={{ color: "var(--text-light)", fontSize: 12 }}>{rev.role}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: "var(--text-h)" }}>{rev.department}</TableCell>
                      <TableCell>
                        <Typography sx={{ color: "#2563EB", fontWeight: 700, fontSize: 16 }}>{rev.rating}</Typography>
                        <Typography sx={{ color: "var(--text-light)", fontSize: 11 }}>/ 5.0</Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 120 }}>
                        <Typography sx={{ fontSize: 12, color: "var(--text-light)", mb: 0.3 }}>{rev.performanceScore} / 100</Typography>
                        <LinearProgress variant="determinate" value={Math.min(rev.performanceScore, 100)} sx={{ height: 5, borderRadius: 2, bgcolor: "var(--hover)" }} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 120 }}>
                        <Typography sx={{ fontSize: 12, color: "var(--text-light)", mb: 0.3 }}>{rev.productivity}%</Typography>
                        <LinearProgress variant="determinate" value={Math.min(rev.productivity, 100)} sx={{ height: 5, borderRadius: 2, bgcolor: "var(--hover)", "& .MuiLinearProgress-bar": { bgcolor: "#7C3AED" } }} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${rev.riskLevel} Risk`}
                          size="small"
                          sx={{
                            bgcolor: (riskColors[rev.riskLevel] || riskColors.Low).bg,
                            color: (riskColors[rev.riskLevel] || riskColors.Low).color,
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "var(--text-h)", fontWeight: 600 }}>{rev.performanceBand}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default Performance;