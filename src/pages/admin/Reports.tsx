import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  Assessment,
  People,
  EventAvailable,
  TrendingDown,
  DownloadForOffline,
  PictureAsPdf,
  TableChart,
  Schedule,
} from "@mui/icons-material";

import { employees } from "../../data/employees";
import { departments } from "../../data/departments";

const exportCSV = (filename: string, rows: string[][]) => {
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const reportCategories = [
  {
    id: "employee",
    icon: <People sx={{ fontSize: 32, color: "#2563EB" }} />,
    title: "Employee Report",
    description: "Full organization-wide employee directory with department, designation, and status.",
    type: "CSV",
    rows: 150,
    lastGenerated: "Today, 10:02 AM",
    color: "#2563EB",
    progress: 100,
  },
  {
    id: "attendance",
    icon: <EventAvailable sx={{ fontSize: 32, color: "#16A34A" }} />,
    title: "Attendance Report",
    description: "Monthly attendance records with present/absent breakdowns across departments.",
    type: "PDF",
    rows: 720,
    lastGenerated: "Today, 09:45 AM",
    color: "#16A34A",
    progress: 91,
  },
  {
    id: "attrition",
    icon: <TrendingDown sx={{ fontSize: 32, color: "#DC2626" }} />,
    title: "Attrition Report",
    description: "Flight risk indicators, resignation trends and voluntary turnover analytics.",
    type: "CSV",
    rows: 48,
    lastGenerated: "Yesterday, 4:15 PM",
    color: "#DC2626",
    progress: 74,
  },
  {
    id: "payroll",
    icon: <Assessment sx={{ fontSize: 32, color: "#7C3AED" }} />,
    title: "Payroll Summary",
    description: "Department-wise payroll totals, compensation bands, and budget utilization.",
    type: "CSV",
    rows: 95,
    lastGenerated: "Aug 1, 2026",
    color: "#7C3AED",
    progress: 88,
  },
  {
    id: "department",
    icon: <TableChart sx={{ fontSize: 32, color: "#D97706" }} />,
    title: "Department Analytics",
    description: "Department headcounts, performance scores, and comparative KPI breakdowns.",
    type: "CSV",
    rows: departments.length,
    lastGenerated: "Aug 2, 2026",
    color: "#D97706",
    progress: 60,
  },
  {
    id: "scheduled",
    icon: <Schedule sx={{ fontSize: 32, color: "#0891B2" }} />,
    title: "Scheduled Reports",
    description: "Auto-generated weekly and monthly reports delivered directly to admin inbox.",
    type: "PDF",
    rows: 0,
    lastGenerated: "Recurring",
    color: "#0891B2",
    progress: 100,
  },
];

const Reports = () => {
  const [generating, setGenerating] = useState<string | null>(null);

  const handleExport = (id: string) => {
    setGenerating(id);
    setTimeout(() => {
      if (id === "employee") {
        const headers = ["Employee ID", "Name", "Department", "Role", "Status"];
        const rows: string[][] = [headers];
        employees.slice(0, 30).forEach((emp) => {
          const e = emp as unknown as Record<string, unknown>;
          rows.push([
            String(e.employeeId || e.id || ""),
            String(e.fullName || e.name || ""),
            String(e.department || ""),
            String(e.designation || e.role || ""),
            "Active",
          ]);
        });
        exportCSV("employee_report.csv", rows);
      } else if (id === "department") {
        const headers = ["Department", "Total Employees", "Manager", "Performance Score"];
        const rows: string[][] = [headers];
        departments.forEach((d) => {
          rows.push([d.name, String(d.totalEmployees), d.manager, String(d.performanceScore) + "%"]);
        });
        exportCSV("department_report.csv", rows);
      }
      setGenerating(null);
    }, 1000);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: "var(--text-h)", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
          <Assessment fontSize="large" sx={{ color: "var(--primary)" }} /> Organization Reports
        </Typography>
        <Typography sx={{ color: "var(--text-light)", mt: 1 }}>
          Export employee and workforce reports for audits and stakeholder insights.
        </Typography>
      </Box>

      {/* Summary Row */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2, mb: 4 }}>
        {[
          { label: "Total Employees", value: employees.length },
          { label: "Departments", value: departments.length },
          { label: "Reports Available", value: reportCategories.length },
          { label: "Last Export", value: "Today" },
        ].map((s) => (
          <Paper key={s.label} elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
            <Typography sx={{ color: "var(--text-light)", fontSize: 13, mb: 1 }}>{s.label}</Typography>
            <Typography sx={{ color: "var(--primary)", fontSize: 28, fontWeight: 800 }}>{s.value}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Report Cards Grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 3 }}>
        {reportCategories.map((report) => (
          <Paper
            key={report.id}
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid var(--border)",
              bgcolor: "var(--surface)",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              transition: "box-shadow 0.2s",
              "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {report.icon}
                <Chip
                  label={report.type}
                  size="small"
                  icon={report.type === "CSV" ? <DownloadForOffline fontSize="small" /> : <PictureAsPdf fontSize="small" />}
                  sx={{
                    bgcolor: report.type === "CSV" ? "#2563EB22" : "#DC262622",
                    color: report.type === "CSV" ? "#2563EB" : "#DC2626",
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                />
              </Box>
            </Box>

            <Typography sx={{ color: "var(--text-h)", fontWeight: 700, fontSize: 17 }}>{report.title}</Typography>
            <Typography sx={{ color: "var(--text-light)", fontSize: 13, lineHeight: 1.6 }}>{report.description}</Typography>

            <Divider sx={{ borderColor: "var(--border)", my: 0.5 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-light)" }}>
              <span>Last: {report.lastGenerated}</span>
              {report.rows > 0 && <span>{report.rows} records</span>}
            </Box>

            {report.progress < 100 && (
              <LinearProgress
                variant="determinate"
                value={report.progress}
                sx={{ borderRadius: 2, height: 5, bgcolor: "var(--hover)" }}
              />
            )}

            <Button
              variant="contained"
              fullWidth
              startIcon={<DownloadForOffline />}
              disabled={generating === report.id}
              onClick={() => handleExport(report.id)}
              sx={{ mt: 1, borderRadius: 2, fontWeight: 600, bgcolor: report.color, "&:hover": { bgcolor: report.color, opacity: 0.9 } }}
            >
              {generating === report.id ? "Generating…" : `Export ${report.type}`}
            </Button>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default Reports;