import { useState, useMemo, useEffect } from "react";
import { Box, Paper, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment, IconButton, Collapse, Tooltip } from "@mui/material";
import { EventAvailable, Search, DownloadForOffline, CalendarMonth } from "@mui/icons-material";
import { attendanceApi } from "../../services/attendanceApi";
import { AttendanceRecord } from "../../types/attendance";
import CorrectionRequests from "../../components/Attendance/CorrectionRequests";
import { AttendanceCalendar } from "../../components/Attendance/AttendanceCalendar";
import { SmartAttendanceTable } from "../../components/Attendance/SmartAttendanceTable";

const statusColors: Record<string, { bg: string; color: string }> = {
  Present: { bg: "#16A34A22", color: "#16A34A" },
  Late: { bg: "#D9770622", color: "#D97706" },
  Absent: { bg: "#DC262622", color: "#DC2626" },
  "Half Day": { bg: "#2563EB22", color: "#2563EB" },
};


const Attendance = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [showCalendar, setShowCalendar] = useState(true);
  const [liveData, setLiveData] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const fetchLive = async () => {
      const records = await attendanceApi.getAllRecords();
      setLiveData(records);
    };
    fetchLive();
    
    const handleUpdate = () => fetchLive();
    window.addEventListener('attendance_updated', handleUpdate);
    return () => window.removeEventListener('attendance_updated', handleUpdate);
  }, []);

  const filteredRecords = useMemo(() => {
    return liveData.filter((r) => {
      const q = search.toLowerCase();
      return (
        (r.employeeName.toLowerCase().includes(q) || r.employeeId.toLowerCase().includes(q)) &&
        (statusFilter === "All" || r.status === statusFilter) &&
        (deptFilter === "All" || r.department === deptFilter) &&
        (dateFilter === "" || r.date === dateFilter)
      );
    });
  }, [liveData, search, statusFilter, deptFilter, dateFilter]);

  const departments = ["All", ...Array.from(new Set(liveData.map((a) => a.department || "Unknown")))];

  const summary = ["Present", "Late", "Absent", "Half Day"].map((s) => ({
    label: s,
    count: liveData.filter((r) => r.status === s || (s === "Late" && r.lateArrival)).length,
    ...statusColors[s],
  }));

  const exportCSV = () => {
    const headers = ["Employee ID", "Name", "Department", "Date", "Shift", "Check In", "Check Out", "Hours", "Status", "Flags"];
    const csvRows = filteredRecords.map((r) => {
      const flags = [];
      if (r.lateArrival) flags.push("Late");
      if (r.isOvertime) flags.push("Overtime");
      if (r.source === "Offline") flags.push("Offline");
      return [r.employeeId, r.employeeName, r.department, r.date, r.shiftType || 'Regular', r.checkInTime || '--', r.checkOutTime || '--', r.workingHours ?? '--', r.status, flags.join(", ")];
    });
    const csv = [headers, ...csvRows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hr_attendance_report.csv";
    a.click();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "var(--text-h)", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
            <EventAvailable fontSize="large" sx={{ color: "var(--primary)" }} /> Global Attendance
          </Typography>
          <Typography sx={{ color: "var(--text-light)", mt: 1 }}>
            Monitor daily check-ins, tardiness, absence trends, and manage corrections across all departments.
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
            <Typography sx={{ color: s.color || "#000", fontSize: 34, fontWeight: 800 }}>{s.count}</Typography>
          </Paper>
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        <Tooltip title={showCalendar ? "Hide Calendar" : "Show Calendar"}>
          <IconButton 
            onClick={() => setShowCalendar(!showCalendar)} 
            sx={{ bgcolor: showCalendar ? "var(--primary)" : "var(--surface)", color: showCalendar ? "#fff" : "var(--text-light)", '&:hover': { bgcolor: showCalendar ? "var(--primary)" : "var(--border)" } }}
          >
            <CalendarMonth fontSize="small" />
          </IconButton>
        </Tooltip>

        <TextField
          size="small" placeholder="Search employee..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 200, bgcolor: "var(--surface)" }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: "var(--text-light)" }} /></InputAdornment> } }}
        />
        <TextField
          type="date"
          size="small"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          sx={{ minWidth: 160, bgcolor: "var(--surface)", '& input': { color: dateFilter ? 'var(--text-h)' : 'var(--text-light)' } }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ bgcolor: "var(--surface)" }}>
            {["All", "Present", "Absent", "Half Day"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Department</InputLabel>
          <Select label="Department" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} sx={{ bgcolor: "var(--surface)" }}>
            {departments.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, mb: 4 }}>
        <Collapse in={showCalendar} orientation="horizontal" unmountOnExit>
          <Box sx={{ flexShrink: 0 }}>
            <AttendanceCalendar 
              records={liveData} 
              selectedDate={dateFilter} 
              onSelectDate={setDateFilter} 
            />
          </Box>
        </Collapse>

        <Box sx={{ flex: 1, minWidth: 300 }}>
          <SmartAttendanceTable records={filteredRecords} role="HR" />
        </Box>
      </Box>
      
      <CorrectionRequests />
    </Box>
  );
};

export default Attendance;