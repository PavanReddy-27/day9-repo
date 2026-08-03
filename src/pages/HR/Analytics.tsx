import {
  Box,
  Typography,
  Paper,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Analytics as AnalyticsIcon } from "@mui/icons-material";
import { departments } from "../../data/departments";

const headcountData = departments.map((d) => ({ name: d.shortName, employees: d.totalEmployees }));

const attritionTrend = [
  { month: "Jan", attrition: 2.1, industry: 4.5 },
  { month: "Feb", attrition: 1.9, industry: 4.3 },
  { month: "Mar", attrition: 2.4, industry: 4.6 },
  { month: "Apr", attrition: 1.7, industry: 4.4 },
  { month: "May", attrition: 2.0, industry: 4.2 },
  { month: "Jun", attrition: 1.5, industry: 4.1 },
  { month: "Jul", attrition: 1.8, industry: 4.3 },
];

const genderData = [
  { name: "Male", value: 58, color: "#2563EB" },
  { name: "Female", value: 38, color: "#DB2777" },
  { name: "Other", value: 4, color: "#7C3AED" },
];

const retentionTargets = [
  { department: "Engineering", current: 96.8, target: 95 },
  { department: "Human Resources", current: 98.2, target: 97 },
  { department: "Sales", current: 94.3, target: 95 },
  { department: "Finance", current: 97.6, target: 96 },
  { department: "Marketing", current: 96.2, target: 95 },
  { department: "Operations", current: 97.1, target: 96 },
];

const kpis = [
  { label: "Total Headcount", value: departments.reduce((s, d) => s + d.totalEmployees, 0).toLocaleString(), color: "#2563EB" },
  { label: "Avg Retention Rate", value: "95.8%", color: "#16A34A" },
  { label: "Avg Performance Score", value: `${Math.round(departments.reduce((s, d) => s + d.performanceScore, 0) / departments.length)}%`, color: "#7C3AED" },
  { label: "Avg Engagement Score", value: `${Math.round(departments.reduce((s, d) => s + d.engagementScore, 0) / departments.length)}%`, color: "#D97706" },
];

const HRAnalytics = () => {
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
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2, mb: 4 }}>
        {kpis.map((k) => (
          <Paper key={k.label} elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
            <Typography sx={{ color: "var(--text-light)", fontSize: 13, mb: 1 }}>{k.label}</Typography>
            <Typography sx={{ color: k.color, fontSize: 30, fontWeight: 800 }}>{k.value}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Charts Row 1 */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mb: 3 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
          <Typography sx={{ color: "var(--text-h)", fontWeight: 700, mb: 2 }}>Headcount by Department</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={headcountData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text-light)", fontSize: 12 }} />
              <YAxis tick={{ fill: "var(--text-light)", fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="employees" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
          <Typography sx={{ color: "var(--text-h)", fontWeight: 700, mb: 2 }}>Workforce by Gender</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={genderData} dataKey="value" nameKey="name" outerRadius={85} label={({ name, value }) => `${name}: ${value}%`}>
                {genderData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Attrition Trend */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)", mb: 3 }}>
        <Typography sx={{ color: "var(--text-h)", fontWeight: 700, mb: 2 }}>Attrition Trend vs Industry Average (%)</Typography>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={attritionTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fill: "var(--text-light)", fontSize: 12 }} />
            <YAxis tick={{ fill: "var(--text-light)", fontSize: 12 }} domain={[0, 6]} />
            <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }} />
            <Legend />
            <Line type="monotone" dataKey="attrition" name="Our Attrition" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="industry" name="Industry Avg" stroke="#DC2626" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

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