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
  TextField,
  Chip,
  InputAdornment,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { ManageSearch, Search } from "@mui/icons-material";

interface AuditEntry {
  id: number;
  user: string;
  role: "Admin" | "HR" | "Manager";
  action: string;
  module: string;
  description: string;
  timestamp: string;
  status: "Success" | "Warning" | "Failed";
}

const auditData: AuditEntry[] = [
  { id: 1, user: "System Administrator", role: "Admin", action: "Created User", module: "Users", description: "Created user account for Emily Zhang (HR Analyst)", timestamp: "2026-08-03, 10:12 AM", status: "Success" },
  { id: 2, user: "David Miller", role: "HR", action: "Updated Employee", module: "Employees", description: "Updated job title for Alex Rivera from Developer → Senior Developer", timestamp: "2026-08-03, 09:48 AM", status: "Success" },
  { id: 3, user: "System Administrator", role: "Admin", action: "Changed Role", module: "Roles", description: "Revoked delete permission from Manager role", timestamp: "2026-08-03, 09:22 AM", status: "Warning" },
  { id: 4, user: "Robert King", role: "Manager", action: "Approved Leave", module: "Leave", description: "Approved annual leave for Priya Sharma (Aug 5–8)", timestamp: "2026-08-03, 08:55 AM", status: "Success" },
  { id: 5, user: "System Administrator", role: "Admin", action: "Exported Report", module: "Reports", description: "Exported full employee directory as employee_report.csv", timestamp: "2026-08-02, 05:30 PM", status: "Success" },
  { id: 6, user: "David Miller", role: "HR", action: "Rejected Leave", module: "Leave", description: "Rejected leave request #109 for David Kim", timestamp: "2026-08-02, 04:12 PM", status: "Warning" },
  { id: 7, user: "System Administrator", role: "Admin", action: "Deactivated User", module: "Users", description: "Deactivated account for Tom Bradley (Marketing Analyst)", timestamp: "2026-08-02, 02:44 PM", status: "Warning" },
  { id: 8, user: "David Miller", role: "HR", action: "Added Recruitment", module: "Recruitment", description: "Posted new job requisition for Senior Data Engineer", timestamp: "2026-08-02, 01:20 PM", status: "Success" },
  { id: 9, user: "System Administrator", role: "Admin", action: "Updated Settings", module: "Settings", description: "Changed session expiry from 6h to 8h", timestamp: "2026-08-01, 11:05 AM", status: "Success" },
  { id: 10, user: "Robert King", role: "Manager", action: "Performance Review", module: "Performance", description: "Submitted Q2 performance review for 12 team members", timestamp: "2026-08-01, 10:30 AM", status: "Success" },
  { id: 11, user: "Unknown", role: "Admin", action: "Login Failed", module: "Auth", description: "Failed login attempt on admin account — IP: 192.168.3.18", timestamp: "2026-07-31, 08:22 PM", status: "Failed" },
  { id: 12, user: "David Miller", role: "HR", action: "Exported Attendance", module: "Attendance", description: "Exported July attendance report for HR records", timestamp: "2026-07-31, 03:45 PM", status: "Success" },
];

const roleColors: Record<string, { bg: string; color: string }> = {
  Admin: { bg: "#7C3AED22", color: "#7C3AED" },
  HR: { bg: "#2563EB22", color: "#2563EB" },
  Manager: { bg: "#D9770622", color: "#D97706" },
};

const statusColors: Record<string, { bg: string; color: string }> = {
  Success: { bg: "#16A34A22", color: "#16A34A" },
  Warning: { bg: "#D9770622", color: "#D97706" },
  Failed: { bg: "#DC262622", color: "#DC2626" },
};

const avatarColors = ["#2563EB", "#7C3AED", "#16A34A", "#D97706", "#DC2626", "#0891B2"];

const AuditLogs = () => {
  const [search, setSearch] = useState("");
  const [filterModule, setFilterModule] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const modules = ["All", ...Array.from(new Set(auditData.map((a) => a.module)))];
  const statuses = ["All", "Success", "Warning", "Failed"];

  const filtered = useMemo(() => {
    return auditData.filter((entry) => {
      const q = search.toLowerCase();
      const matchesSearch =
        entry.user.toLowerCase().includes(q) ||
        entry.action.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q);
      const matchesModule = filterModule === "All" || entry.module === filterModule;
      const matchesStatus = filterStatus === "All" || entry.status === filterStatus;
      return matchesSearch && matchesModule && matchesStatus;
    });
  }, [search, filterModule, filterStatus]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: "var(--text-h)", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
          <ManageSearch fontSize="large" sx={{ color: "var(--primary)" }} /> Audit Logs
        </Typography>
        <Typography sx={{ color: "var(--text-light)", mt: 1 }}>
          Review all user actions, system changes, and security events in one timeline.
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 2, mb: 4 }}>
        {[
          { label: "Total Events", value: auditData.length, color: "var(--primary)" },
          { label: "Successful", value: auditData.filter((a) => a.status === "Success").length, color: "#16A34A" },
          { label: "Warnings", value: auditData.filter((a) => a.status === "Warning").length, color: "#D97706" },
          { label: "Failures", value: auditData.filter((a) => a.status === "Failed").length, color: "#DC2626" },
        ].map((s) => (
          <Paper key={s.label} elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
            <Typography sx={{ color: "var(--text-light)", fontSize: 13, mb: 1 }}>{s.label}</Typography>
            <Typography sx={{ color: s.color, fontSize: 30, fontWeight: 800 }}>{s.value}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search users, actions, descriptions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 220, bgcolor: "var(--surface)", borderRadius: 2 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: "var(--text-light)" }} /></InputAdornment> } }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Module</InputLabel>
          <Select label="Module" value={filterModule} onChange={(e) => setFilterModule(e.target.value)} sx={{ bgcolor: "var(--surface)" }}>
            {modules.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} sx={{ bgcolor: "var(--surface)" }}>
            {statuses.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
        <Table>
          <TableHead>
            <TableRow>
              {["User", "Role", "Action", "Module", "Description", "Timestamp", "Status"].map((h) => (
                <TableCell key={h} sx={{ color: "var(--text-light)", fontWeight: 600, borderColor: "var(--border)", whiteSpace: "nowrap" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ color: "var(--text-light)", py: 6 }}>
                  No logs match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((entry, i) => (
                <TableRow key={entry.id} sx={{ borderColor: "var(--border)" }}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: avatarColors[i % avatarColors.length] }}>
                        {entry.user[0]}
                      </Avatar>
                      <Typography sx={{ color: "var(--text-h)", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                        {entry.user}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={entry.role} size="small" sx={{ bgcolor: roleColors[entry.role].bg, color: roleColors[entry.role].color, fontWeight: 600 }} />
                  </TableCell>
                  <TableCell sx={{ color: "var(--text-h)", fontWeight: 500, whiteSpace: "nowrap" }}>{entry.action}</TableCell>
                  <TableCell>
                    <Chip label={entry.module} size="small" variant="outlined" sx={{ color: "var(--text-light)", borderColor: "var(--border)", fontSize: 11 }} />
                  </TableCell>
                  <TableCell sx={{ color: "var(--text-light)", fontSize: 13, maxWidth: 280 }}>{entry.description}</TableCell>
                  <TableCell sx={{ color: "var(--text-light)", fontSize: 12, whiteSpace: "nowrap" }}>{entry.timestamp}</TableCell>
                  <TableCell>
                    <Chip
                      label={entry.status}
                      size="small"
                      sx={{ bgcolor: statusColors[entry.status].bg, color: statusColors[entry.status].color, fontWeight: 600 }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AuditLogs;