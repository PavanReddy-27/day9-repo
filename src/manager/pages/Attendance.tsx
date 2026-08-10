import { useState, useEffect, useMemo } from "react";
import { useAppSelector } from "../../hooks/redux";
import { Box, Paper, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment, IconButton, Collapse, Tooltip } from "@mui/material";
import { Search, CalendarMonth } from "@mui/icons-material";
import { attendanceApi } from "../../services/attendanceApi";
import type { AttendanceRecord } from "../../types/attendance";
import CorrectionRequests from "../../components/Attendance/CorrectionRequests";
import { AttendanceCalendar } from "../../components/Attendance/AttendanceCalendar";
import { SmartAttendanceTable } from "../../components/Attendance/SmartAttendanceTable";
import "./Attendance.css";

const Attendance = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [liveData, setLiveData] = useState<AttendanceRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [showCalendar, setShowCalendar] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      if (user) {
        // Manager views their department
        const records = await attendanceApi.getTeamRecords(user.department || "Engineering");
        setLiveData(records);
      }
    };
    fetchRecords();

    const handleUpdate = () => fetchRecords();
    window.addEventListener('attendance_updated', handleUpdate);
    return () => window.removeEventListener('attendance_updated', handleUpdate);
  }, [user]);

  const filteredRecords = useMemo(() => {
    return liveData.filter((r) => {
      const q = search.toLowerCase();
      return (
        (r.employeeName.toLowerCase().includes(q) || r.employeeId.toLowerCase().includes(q)) &&
        (statusFilter === "All" || r.status === statusFilter) &&
        (dateFilter === "" || r.date === dateFilter)
      );
    });
  }, [liveData, search, statusFilter, dateFilter]);

  const today = new Date().toISOString().split("T")[0];
  const todaysRows = liveData.filter(r => r.date === today);

  const present = todaysRows.filter((r) => r.status === "Present").length;
  const leave = todaysRows.filter((r) => r.status === "Leave").length;
  const absent = todaysRows.filter((r) => r.status === "Absent").length;

  const exportCSV = () => {
    const headers = ["Employee ID", "Employee", "Date", "Check In", "Check Out", "Hours", "Status", "Flags"];
    const csvRows = filteredRecords.map((r) => {
      const flags = [];
      if (r.lateArrival) flags.push("Late");
      if (r.isOvertime) flags.push("Overtime");
      if (r.source === "Offline") flags.push("Offline");
      return [r.employeeId, r.employeeName, r.date, r.checkInTime || '--', r.checkOutTime || '--', r.workingHours ?? '--', r.status, flags.join(", ")];
    });
    const csv = [headers, ...csvRows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "team_attendance_report.csv";
    a.click();
  };

  return (
    <Box className="attendance-page" sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" className="attendance-title" sx={{ fontWeight: 700 }}>
          👥 Team Attendance Overview
        </Typography>
        <Button variant="outlined" onClick={exportCSV} sx={{ borderRadius: 2 }}>
          Export CSV
        </Button>
      </Box>

      <div className="attendance-summary">
        <Paper elevation={0} className="attendance-card" sx={{ border: "1px solid var(--border)", borderRadius: 3 }}>
          <Typography className="attendance-label">Present Today</Typography>
          <Typography variant="h4" className="attendance-present">{present}</Typography>
        </Paper>

        <Paper elevation={0} className="attendance-card" sx={{ border: "1px solid var(--border)", borderRadius: 3 }}>
          <Typography className="attendance-label">On Leave</Typography>
          <Typography variant="h4" className="attendance-leave">{leave}</Typography>
        </Paper>

        <Paper elevation={0} className="attendance-card" sx={{ border: "1px solid var(--border)", borderRadius: 3 }}>
          <Typography className="attendance-label">Absent</Typography>
          <Typography variant="h4" className="attendance-absent">{absent}</Typography>
        </Paper>
      </div>

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
            {["All", "Present", "Leave", "Absent"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
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
          <SmartAttendanceTable records={filteredRecords} role="Manager" />
        </Box>
      </Box>

      <CorrectionRequests />
    </Box>
  );
};

export default Attendance;