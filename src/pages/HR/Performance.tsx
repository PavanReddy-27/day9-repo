import { useState, useMemo } from "react";
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
} from "@mui/material";
import { TrendingUp, Search } from "@mui/icons-material";

interface ReviewItem {
  id: string;
  employeeName: string;
  role: string;
  department: string;
  rating: number;
  riskLevel: "Low" | "Medium" | "High";
  lastReview: string;
  goals: number;
  training: number;
}

const reviews: ReviewItem[] = [
  { id: "EMP001", employeeName: "John Smith", role: "Senior Software Engineer", department: "Engineering", rating: 4.8, riskLevel: "Low", lastReview: "2026-06-15", goals: 92, training: 100 },
  { id: "EMP002", employeeName: "Priya Sharma", role: "Business Analyst", department: "Analytics", rating: 4.2, riskLevel: "Low", lastReview: "2026-05-20", goals: 85, training: 90 },
  { id: "EMP003", employeeName: "David Kim", role: "HR Specialist", department: "Human Resources", rating: 3.1, riskLevel: "High", lastReview: "2026-07-10", goals: 58, training: 72 },
  { id: "EMP004", employeeName: "Maria Garcia", role: "Marketing Manager", department: "Marketing", rating: 4.5, riskLevel: "Low", lastReview: "2026-06-01", goals: 91, training: 95 },
  { id: "EMP005", employeeName: "Robert King", role: "Operations Manager", department: "Operations", rating: 4.0, riskLevel: "Medium", lastReview: "2026-07-01", goals: 75, training: 80 },
  { id: "EMP006", employeeName: "Emily Zhang", role: "Finance Analyst", department: "Finance", rating: 4.6, riskLevel: "Low", lastReview: "2026-05-30", goals: 94, training: 98 },
  { id: "EMP007", employeeName: "Alex Rivera", role: "Senior Developer", department: "Engineering", rating: 3.8, riskLevel: "Medium", lastReview: "2026-06-25", goals: 70, training: 75 },
  { id: "EMP008", employeeName: "Nancy Cooper", role: "Sales Executive", department: "Sales", rating: 2.9, riskLevel: "High", lastReview: "2026-07-05", goals: 52, training: 60 },
];

const riskColors: Record<string, { bg: string; color: string }> = {
  Low: { bg: "#16A34A22", color: "#16A34A" },
  Medium: { bg: "#D9770622", color: "#D97706" },
  High: { bg: "#DC262622", color: "#DC2626" },
};

const avatarColors = ["#2563EB", "#7C3AED", "#DB2777", "#D97706", "#16A34A", "#0891B2", "#DC2626", "#0891B2"];

const Performance = () => {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");

  const depts = ["All", ...Array.from(new Set(reviews.map((r) => r.department)))];

  const filtered = useMemo(() =>
    reviews.filter((r) => {
      const q = search.toLowerCase();
      return (
        (r.employeeName.toLowerCase().includes(q) || r.role.toLowerCase().includes(q)) &&
        (riskFilter === "All" || r.riskLevel === riskFilter) &&
        (deptFilter === "All" || r.department === deptFilter)
      );
    }), [search, riskFilter, deptFilter]);

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: "var(--text-h)", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
          <TrendingUp fontSize="large" sx={{ color: "var(--primary)" }} /> Performance & Attrition Monitoring
        </Typography>
        <Typography sx={{ color: "var(--text-light)", mt: 1 }}>
          Track performance appraisal scores and flight-risk indicators across departments.
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 2, mb: 4 }}>
        {[
          { label: "Employees Reviewed", value: reviews.length, color: "#2563EB" },
          { label: "Avg Rating", value: `${avgRating}/5`, color: "#16A34A" },
          { label: "High Risk", value: reviews.filter((r) => r.riskLevel === "High").length, color: "#DC2626" },
          { label: "Low Risk", value: reviews.filter((r) => r.riskLevel === "Low").length, color: "#16A34A" },
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
            {["All", "Low", "Medium", "High"].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
        <Table>
          <TableHead>
            <TableRow>
              {["Employee", "Department", "Rating", "Goals %", "Training %", "Attrition Risk", "Last Review"].map((h) => (
                <TableCell key={h} sx={{ color: "var(--text-light)", fontWeight: 600, borderColor: "var(--border)" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((rev, i) => (
              <TableRow key={rev.id}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, fontSize: 13, bgcolor: avatarColors[i % avatarColors.length] }}>{rev.employeeName[0]}</Avatar>
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
                  <Typography sx={{ fontSize: 12, color: "var(--text-light)", mb: 0.3 }}>{rev.goals}%</Typography>
                  <LinearProgress variant="determinate" value={rev.goals} sx={{ height: 5, borderRadius: 2, bgcolor: "var(--hover)" }} />
                </TableCell>
                <TableCell sx={{ minWidth: 120 }}>
                  <Typography sx={{ fontSize: 12, color: "var(--text-light)", mb: 0.3 }}>{rev.training}%</Typography>
                  <LinearProgress variant="determinate" value={rev.training} sx={{ height: 5, borderRadius: 2, bgcolor: "var(--hover)", "& .MuiLinearProgress-bar": { bgcolor: "#7C3AED" } }} />
                </TableCell>
                <TableCell>
                  <Chip label={`${rev.riskLevel} Risk`} size="small" sx={{ bgcolor: riskColors[rev.riskLevel].bg, color: riskColors[rev.riskLevel].color, fontWeight: 600 }} />
                </TableCell>
                <TableCell sx={{ color: "var(--text-light)", fontSize: 13 }}>{rev.lastReview}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Performance;