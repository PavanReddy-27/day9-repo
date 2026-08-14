import { useState, useEffect, useMemo } from "react";
import { Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Collapse, Tooltip } from "@mui/material";
import { EventAvailable, CalendarMonth } from "@mui/icons-material";
import { attendanceApi } from "../../services/attendanceApi";
import type { AttendanceRecord } from "../../types/attendance";
import { useAppSelector } from "../../hooks/redux";
import AttendanceTracker from "../../components/Attendance/AttendanceTracker";
import AttendanceChart from "../../components/Attendance/AttendanceChart";
import { AttendanceCalendar } from "../../components/Attendance/AttendanceCalendar";
import { SmartAttendanceTable } from "../../components/Attendance/SmartAttendanceTable";

const EmployeeAttendance = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [showCalendar, setShowCalendar] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      if (user) {
        // We let the backend securely scope to the logged-in employee automatically
        const history = await attendanceApi.getEmployeeRecords();
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
      const matchesDate = (dateFilter === "" || r.date === dateFilter);
      let matchesStatus = true;
      if (statusFilter === "Present") {
        matchesStatus = r.status === "Present" || ["Working", "On Break", "Checked Out"].includes(r.attendanceState ?? "");
      } else if (statusFilter === "Absent") {
        matchesStatus = r.status === "Absent" || r.attendanceState === "Not Checked In";
      } else if (statusFilter === "Leave" || statusFilter === "Half Day" || statusFilter === "Half Leave") {
        matchesStatus = r.status === "Leave" || r.status === "Half Day" || r.status === "Half-Day" || r.status === "Half Leave" || ((r.workingHours ?? 0) > 0 && (r.workingHours ?? 0) < 5);
      }
      return matchesStatus && matchesDate;
    });
  }, [records, statusFilter, dateFilter]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "var(--text-h)", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
            <EventAvailable fontSize="large" sx={{ color: "var(--primary)" }} /> My Attendance & Shifts
          </Typography>
          <Typography sx={{ color: "var(--text-light)", mt: 1 }}>
            Track your daily check-ins, manage your shifts, and submit correction requests.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1 }}>
        {/* Row 1: Tracker */}
        <Box>
          <AttendanceTracker />
        </Box>

        {/* Row 2: Chart */}
        <Box>
          <AttendanceChart records={records} />
        </Box>

        {/* Row 3: History Header/Toolbar */}
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1, flexWrap: "wrap", gap: 2 }}>
            <Typography variant="h6" sx={{ color: "var(--text-h)", fontWeight: 600, letterSpacing: "-0.01em" }}>Attendance History</Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
              <Tooltip title={showCalendar ? "Hide Calendar" : "Show Calendar"}>
                <IconButton 
                  onClick={() => setShowCalendar(!showCalendar)} 
                  sx={{ bgcolor: showCalendar ? "var(--primary)" : "var(--surface)", color: showCalendar ? "#fff" : "var(--text-light)", borderRadius: 3, '&:hover': { bgcolor: showCalendar ? "var(--primary)" : "var(--border)" } }}
                >
                  <CalendarMonth fontSize="small" />
                </IconButton>
              </Tooltip>
              <TextField
                type="date"
                size="small"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { bgcolor: "var(--surface)", borderRadius: 3 }, '& input': { color: dateFilter ? 'var(--text-h)' : 'var(--text-light)' } }}
              />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ bgcolor: "var(--surface)", borderRadius: 3 }}>
                  {["All", "Present", "Absent", "Leave"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>

        {/* Row 4: Calendar and Table perfectly snapped together */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3, alignItems: "stretch", flexGrow: 1 }}>
          <Collapse in={showCalendar} orientation="horizontal" unmountOnExit sx={{ width: { xs: "100%", lg: "auto" }, transition: "width 0.4s cubic-bezier(0.25, 1, 0.5, 1)", '& .MuiCollapse-wrapper': { height: '100%' }, '& .MuiCollapse-wrapperInner': { height: '100%' } }}>
            <Box sx={{ width: { xs: "100%", lg: "340px" }, flexShrink: 0, height: '100%' }}>
              <AttendanceCalendar 
                records={records} 
                selectedDate={dateFilter} 
                onSelectDate={setDateFilter} 
              />
            </Box>
          </Collapse>
          
          <Box sx={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column" }}>
            <SmartAttendanceTable records={filteredRecords} role="Employee" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EmployeeAttendance;
