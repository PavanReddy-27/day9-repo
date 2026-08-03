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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { EventAvailable, Search, DownloadForOffline } from "@mui/icons-material";

interface AttendanceRecord {
  id: string;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  status: "Present" | "Late" | "Absent" | "Half Day";
}

const attendanceData: AttendanceRecord[] = [
  { id: "EMP001", employeeName: "John Smith", department: "Engineering", date: "2026-08-03", checkIn: "09:02 AM", checkOut: "06:10 PM", hours: "9h 08m", status: "Present" },
  { id: "EMP002", employeeName: "Emily Zhang", department: "HR", date: "2026-08-03", checkIn: "09:45 AM", checkOut: "06:00 PM", hours: "8h 15m", status: "Late" },
  { id: "EMP003", employeeName: "Alex Rivera", department: "Engineering", date: "2026-08-03", checkIn: "-", checkOut: "-", hours: "-", status: "Absent" },
  { id: "EMP004", employeeName: "Priya Sharma", department: "Analytics", date: "2026-08-03", checkIn: "09:00 AM", checkOut: "01:30 PM", hours: "4h 30m", status: "Half Day" },
  { id: "EMP005", employeeName: "David Kim", department: "Finance", date: "2026-08-03", checkIn: "08:55 AM", checkOut: "05:55 PM", hours: "9h 00m", status: "Present" },
  { id: "EMP006", employeeName: "Maria Garcia", department: "Marketing", date: "2026-08-03", checkIn: "09:10 AM", checkOut: "06:15 PM", hours: "9h 05m", status: "Present" },
  { id: "EMP007", employeeName: "Robert King", department: "Operations", date: "2026-08-03", checkIn: "10:02 AM", checkOut: "06:30 PM", hours: "8h 28m", status: "Late" },
  { id: "EMP008", employeeName: "Sara Connor", department: "Finance", date: "2026-08-03", checkIn: "09:00 AM", checkOut: "06:00 PM", hours: "9h 00m", status: "Present" },
  { id: "EMP009", employeeName: "Tom Bradley", department: "Marketing", date: "2026-08-03", checkIn: "-", checkOut: "-", hours: "-", status: "Absent" },
  { id: "EMP010", employeeName: "Nancy Cooper", department: "Engineering", date: "2026-08-03", checkIn: "09:05 AM", checkOut: "06:05 PM", hours: "9h 00m", status: "Present" },
];

const statusColors: Record<string, { bg: string; color: string }> = {
  Present: { bg: "#16A34A22", color: "#16A34A" },
  Late: { bg: "#D9770622", color: "#D97706" },
  Absent: { bg: "#DC262622", color: "#DC2626" },
  "Half Day": { bg: "#2563EB22", color: "#2563EB" },
};

const exportCSV = () => {
  const headers = ["ID", "Employee", "Department", "Date", "Check In", "Check Out", "Hours", "Status"];
  const rows = attendanceData.map((r) => [r.id, r.employeeName, r.department, r.date, r.checkIn, r.checkOut, r.hours, r.status]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "attendance_report.csv";
  a.click();
};

const Attendance = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");

  const departments = ["All", ...Array.from(new Set(attendanceData.map((a) => a.department)))];

  const filtered = useMemo(() =>
    attendanceData.filter((r) => {
      const q = search.toLowerCase();
      return (
        (r.employeeName.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)) &&
        (statusFilter === "All" || r.status === statusFilter) &&
        (deptFilter === "All" || r.department === deptFilter)
      );
    }), [search, statusFilter, deptFilter]);

  const summary = ["Present", "Late", "Absent", "Half Day"].map((s) => ({
    label: s,
    count: attendanceData.filter((r) => r.status === s).length,
    ...statusColors[s],
  }));

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "var(--text-h)", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
            <EventAvailable fontSize="large" sx={{ color: "var(--primary)" }} /> Workforce Attendance
          </Typography>
          <Typography sx={{ color: "var(--text-light)", mt: 1 }}>
            Monitor daily check-ins, tardiness, and absence trends across all departments.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadForOffline />} onClick={exportCSV} sx={{ borderRadius: 2 }}>
          Export CSV
        </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 2, mb: 4 }}>
        {summary.map((s) => (
          <Paper key={s.label} elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)", textAlign: "center" }}>
            <Typography sx={{ color: "var(--text-light)", fontSize: 13, mb: 1 }}>{s.label}</Typography>
            <Typography sx={{ color: s.color, fontSize: 34, fontWeight: 800 }}>{s.count}</Typography>
          </Paper>
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          size="small" placeholder="Search employee..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 200, bgcolor: "var(--surface)" }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: "var(--text-light)" }} /></InputAdornment> } }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ bgcolor: "var(--surface)" }}>
            {["All", "Present", "Late", "Absent", "Half Day"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Department</InputLabel>
          <Select label="Department" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} sx={{ bgcolor: "var(--surface)" }}>
            {departments.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
        <Table>
          <TableHead>
            <TableRow>
              {["Employee ID", "Name", "Department", "Date", "Check In", "Check Out", "Hours", "Status"].map((h) => (
                <TableCell key={h} sx={{ color: "var(--text-light)", fontWeight: 600, borderColor: "var(--border)" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell sx={{ color: "var(--text-light)", fontSize: 13 }}>{row.id}</TableCell>
                <TableCell sx={{ color: "var(--text-h)", fontWeight: 600 }}>{row.employeeName}</TableCell>
                <TableCell sx={{ color: "var(--text-light)" }}>{row.department}</TableCell>
                <TableCell sx={{ color: "var(--text-light)" }}>{row.date}</TableCell>
                <TableCell sx={{ color: "var(--text-h)" }}>{row.checkIn}</TableCell>
                <TableCell sx={{ color: "var(--text-h)" }}>{row.checkOut}</TableCell>
                <TableCell sx={{ color: "var(--text-h)", fontWeight: 500 }}>{row.hours}</TableCell>
                <TableCell>
                  <Chip label={row.status} size="small" sx={{ bgcolor: statusColors[row.status].bg, color: statusColors[row.status].color, fontWeight: 600 }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Attendance;