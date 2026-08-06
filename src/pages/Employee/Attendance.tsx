import { useState, useEffect, useMemo } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Collapse, Tooltip } from "@mui/material";
import { EventAvailable, CalendarMonth } from "@mui/icons-material";
import { attendanceApi } from "../../services/attendanceApi";
import type { AttendanceRecord } from "../../types/attendance";
import { useAppSelector } from "../../hooks/redux";
import AttendanceTracker from "../../components/Attendance/AttendanceTracker";
import CorrectionRequests from "../../components/Attendance/CorrectionRequests";
import AttendanceChart from "../../components/Attendance/AttendanceChart";
import { AttendanceCalendar } from "../../components/Attendance/AttendanceCalendar";
import { SmartAttendanceTable } from "../../components/Attendance/SmartAttendanceTable";

const statusColors: Record<string, { bg: string; color: string }> = {
  Present: { bg: "#16A34A22", color: "#16A34A" },
  Late: { bg: "#D9770622", color: "#D97706" },
  Absent: { bg: "#DC262622", color: "#DC2626" },
  "Half-Day": { bg: "#2563EB22", color: "#2563EB" },
  Leave: { bg: "#9333EA22", color: "#9333EA" },
};

const EmployeeAttendance = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [showCalendar, setShowCalendar] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      if (user) {
        const history = await attendanceApi.getEmployeeRecords(user.id);
        setRecords(history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    };
    
    fetchRecords();
    
    const handleUpdate = () => fetchRecords();
    window.addEventListener('attendance_updated', handleUpdate);
    return () => window.removeEventListener('attendance_updated', handleUpdate);
  }, [user]);



  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      return (
        (statusFilter === "All" || r.status === statusFilter) &&
        (dateFilter === "" || r.date === dateFilter)
      );
    });
  }, [records, statusFilter, dateFilter]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: "var(--text-h)", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
          <EventAvailable fontSize="large" sx={{ color: "var(--primary)" }} /> My Attendance & Shifts
        </Typography>
        <Typography sx={{ color: "var(--text-light)", mt: 1 }}>
          Track your daily check-ins, manage your shifts, and submit correction requests.
        </Typography>
      </Box>

      <Box sx={{ mb: 4, width: '100%' }}>
        <AttendanceTracker />
      </Box>

      <AttendanceChart records={records} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h6" sx={{ color: "var(--text-h)", fontWeight: 600 }}>Attendance History</Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <Tooltip title={showCalendar ? "Hide Calendar" : "Show Calendar"}>
            <IconButton 
              onClick={() => setShowCalendar(!showCalendar)} 
              sx={{ bgcolor: showCalendar ? "var(--primary)" : "var(--surface)", color: showCalendar ? "#fff" : "var(--text-light)", '&:hover': { bgcolor: showCalendar ? "var(--primary)" : "var(--border)" } }}
            >
              <CalendarMonth fontSize="small" />
            </IconButton>
          </Tooltip>
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
              {["All", "Present", "Absent", "Leave"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Box>

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
          <SmartAttendanceTable records={filteredRecords} role="Employee" />
        </Box>
      </Box>

      <CorrectionRequests />
    </Box>
  );
};

export default EmployeeAttendance;
