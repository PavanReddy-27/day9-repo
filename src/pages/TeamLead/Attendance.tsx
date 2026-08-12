import { useState, useMemo, useEffect } from "react";
import { Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment, IconButton, Collapse, Tooltip } from "@mui/material";
import { EventAvailable, Search, CalendarMonth } from "@mui/icons-material";
import { attendanceApi } from "../../services/attendanceApi";
import type { AttendanceRecord } from "../../types/attendance";
import CorrectionRequests from "../../components/Attendance/CorrectionRequests";
import { AttendanceCalendar } from "../../components/Attendance/AttendanceCalendar";
import { SmartAttendanceTable } from "../../components/Attendance/SmartAttendanceTable";
import AttendanceTracker from "../../components/attendance/AttendanceTracker";

const TeamLeadAttendance = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [showCalendar, setShowCalendar] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const history = await attendanceApi.getAllRecords();
        setRecords(history);
      } catch (err) {
        console.error("Failed to fetch team lead attendance records:", err);
      }
    };
    fetchRecords();

    const handleUpdate = () => fetchRecords();
    window.addEventListener('attendance_updated', handleUpdate);
    return () => window.removeEventListener('attendance_updated', handleUpdate);
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = search.toLowerCase();
      return (
        (r.employeeName.toLowerCase().includes(q) || r.employeeId.toLowerCase().includes(q)) &&
        (statusFilter === "All" || r.status === statusFilter) &&
        (dateFilter === "" || r.date === dateFilter)
      );
    });
  }, [records, search, statusFilter, dateFilter]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: "var(--text-h)", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
          <EventAvailable fontSize="large" sx={{ color: "var(--primary)" }} /> Team Lead Attendance & Time Clock
        </Typography>
        <Typography sx={{ color: "var(--text-light)", mt: 1 }}>
          Log your shift check-ins, breaks, and monitor synchronized team attendance metrics.
        </Typography>
      </Box>

      {/* Smart Attendance Time Clock Tracker Widget */}
      <Box sx={{ mb: 4 }}>
        <AttendanceTracker />
      </Box>

      {/* Controls & Filter bar */}
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
          size="small" placeholder="Search team member..." value={search}
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
      </Box>

      {/* Calendar & Smart Attendance Table */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, mb: 4 }}>
        <Collapse in={showCalendar} orientation="horizontal" unmountOnExit>
          <Box sx={{ flexShrink: 0 }}>
            <AttendanceCalendar 
              records={records} 
              selectedDate={dateFilter} 
              onSelectDate={setDateFilter} 
            />
          </Box>
        </Collapse>

        <Box sx={{ flex: 1, minWidth: 300 }}>
          <SmartAttendanceTable records={filteredRecords} role="Team Lead" />
        </Box>
      </Box>

      <CorrectionRequests />
    </Box>
  );
};

export default TeamLeadAttendance;
