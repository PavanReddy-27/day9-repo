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
  Button,
  LinearProgress,
} from "@mui/material";
import { People, Search, DownloadForOffline } from "@mui/icons-material";
import { employees } from "../../data/employees";
import type { Employee } from "../../types/employee";

const riskColors: Record<string, { bg: string; color: string }> = {
  Low: { bg: "#16A34A22", color: "#16A34A" },
  Medium: { bg: "#D9770622", color: "#D97706" },
  High: { bg: "#DC262622", color: "#DC2626" },
};

const exportCSV = (data: Employee[]) => {
  const headers = ["Employee ID", "Name", "Department", "Role", "Location", "Status", "Risk"];
  const rows = data.map((e) => [e.employeeId, e.fullName, e.department, e.designation, e.location, e.status, e.risk]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "employee_directory.csv";
  a.click();
};

const Employees = () => {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");

  const depts = ["All", ...Array.from(new Set(employees.map((e) => e.department)))].sort();

  const filtered = useMemo(() =>
    employees.filter((e) => {
      const q = search.toLowerCase();
      return (
        (e.fullName.toLowerCase().includes(q) || e.employeeId.toLowerCase().includes(q)) &&
        (deptFilter === "All" || e.department === deptFilter) &&
        (riskFilter === "All" || e.risk === riskFilter)
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [employees, search, deptFilter, riskFilter]);

  const avatarColor = (name: string) => {
    const colors = ["#2563EB", "#7C3AED", "#DB2777", "#D97706", "#16A34A", "#0891B2"];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "var(--text-h)", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
            <People fontSize="large" sx={{ color: "var(--primary)" }} /> Employee Directory
          </Typography>
          <Typography sx={{ color: "var(--text-light)", mt: 1 }}>
            Manage, filter, and export organization workforce records.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadForOffline />} onClick={() => exportCSV(filtered)} sx={{ borderRadius: 2 }}>
          Export {filtered.length} Records
        </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 2, mb: 4 }}>
        {[
          { label: "Total Employees", value: employees.length, color: "#2563EB" },
          { label: "Active", value: employees.filter((e) => e.status === "Active").length, color: "#16A34A" },
          { label: "High Risk", value: employees.filter((e) => e.risk === "High").length, color: "#DC2626" },
          { label: "Showing", value: filtered.length, color: "#7C3AED" },
        ].map((s) => (
          <Paper key={s.label} elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
            <Typography sx={{ color: "var(--text-light)", fontSize: 13, mb: 1 }}>{s.label}</Typography>
            <Typography sx={{ color: s.color, fontSize: 30, fontWeight: 800 }}>{s.value}</Typography>
          </Paper>
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          size="small" placeholder="Search by name or ID..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 220, bgcolor: "var(--surface)" }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: "var(--text-light)" }} /></InputAdornment> } }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
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
              {["Employee", "ID", "Department", "Designation", "Location", "Performance", "Risk"].map((h) => (
                <TableCell key={h} sx={{ color: "var(--text-light)", fontWeight: 600, borderColor: "var(--border)" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.slice(0, 20).map((emp) => (
              <TableRow key={emp.employeeId}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: avatarColor(emp.fullName) }}>{emp.firstName[0]}</Avatar>
                    <Box>
                      <Typography sx={{ color: "var(--text-h)", fontWeight: 600, fontSize: 14 }}>{emp.fullName}</Typography>
                      <Typography sx={{ color: "var(--text-light)", fontSize: 12 }}>{emp.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: "var(--text-light)", fontSize: 13 }}>{emp.employeeId}</TableCell>
                <TableCell sx={{ color: "var(--text-h)" }}>{emp.department}</TableCell>
                <TableCell sx={{ color: "var(--text-light)", fontSize: 13 }}>{emp.designation}</TableCell>
                <TableCell sx={{ color: "var(--text-light)" }}>{emp.location}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "var(--text-light)", mb: 0.3 }}>{emp.performanceScore ?? 85}%</Typography>
                    <LinearProgress variant="determinate" value={emp.performanceScore ?? 85} sx={{ height: 5, borderRadius: 2, bgcolor: "var(--hover)" }} />
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={emp.risk}
                    size="small"
                    sx={{ bgcolor: riskColors[emp.risk]?.bg ?? "#e2e8f0", color: riskColors[emp.risk]?.color ?? "#334155", fontWeight: 600 }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {filtered.length > 20 && (
        <Typography sx={{ mt: 2, textAlign: "center", color: "var(--text-light)", fontSize: 13 }}>
          Showing 20 of {filtered.length} results. Export CSV to see all.
        </Typography>
      )}
    </Box>
  );
};

export default Employees;