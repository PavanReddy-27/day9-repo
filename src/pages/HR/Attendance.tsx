import { useState, useMemo, useEffect } from "react";
import { Box, Paper, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment, IconButton, Collapse, Tooltip, Chip } from "@mui/material";
import { EventAvailable, Search, DownloadForOffline, CalendarMonth, CheckCircle, Cancel, Schedule, BeachAccess, Groups } from "@mui/icons-material";
import { attendanceApi } from "../../services/attendanceApi";
import { AttendanceRecord } from "../../types/attendance";
import { useAppSelector } from "../../hooks/redux";
import { AttendanceCalendar } from "../../components/Attendance/AttendanceCalendar";
import { SmartAttendanceTable } from "../../components/Attendance/SmartAttendanceTable";
import CorrectionRequests from "../../components/attendance/CorrectionRequests";

const STATUS_BUTTONS = [
  { id: "All", label: "All", color: "#64748B", bg: "#64748B1A", activeBg: "#64748B", icon: Groups },
  { id: "Present", label: "Present", color: "#16A34A", bg: "#16A34A1A", activeBg: "#16A34A", icon: CheckCircle },
  { id: "Absent", label: "Absent", color: "#DC2626", bg: "#DC26261A", activeBg: "#DC2626", icon: Cancel },
  { id: "Late", label: "Late", color: "#D97706", bg: "#D977061A", activeBg: "#D97706", icon: Schedule },
  { id: "Half Leave", label: "Half Leave", color: "#2563EB", bg: "#2563EB1A", activeBg: "#2563EB", icon: BeachAccess },
];

const Attendance = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [showCalendar, setShowCalendar] = useState(true);
  const [liveData, setLiveData] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const fetchLive = async () => {
      // Global roster: EVERY employee for the selected date (default today),
      // straight from MongoDB — shows who has checked in and who has not.
      const records = await attendanceApi.getGlobalAttendance(dateFilter || undefined);
      setLiveData(records);
    };
    fetchLive();

    const handleUpdate = () => fetchLive();
    window.addEventListener('attendance_updated', handleUpdate);
    return () => window.removeEventListener('attendance_updated', handleUpdate);
  }, [dateFilter]);

  const summaryCounts = useMemo(() => {
    const all = liveData.length;
    const present = liveData.filter((r) => r.status === "Present" || ["Working", "On Break", "Checked Out"].includes(r.attendanceState ?? "")).length;
    const absent = liveData.filter((r) => r.status === "Absent" || r.attendanceState === "Not Checked In").length;
    const late = liveData.filter((r) => r.lateArrival || r.status === "Late").length;
    const halfLeave = liveData.filter((r) => r.status === "Half Day" || r.status === "Half-Day" || r.status === "Half Leave" || r.status === "Leave" || ((r.workingHours ?? 0) > 0 && (r.workingHours ?? 0) < 5)).length;
    return { All: all, Present: present, Absent: absent, Late: late, "Half Leave": halfLeave };
  }, [liveData]);

  const filteredRecords = useMemo(() => {
    return liveData.filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch = ((r.employeeName ?? "").toLowerCase().includes(q) || String(r.employeeId ?? "").toLowerCase().includes(q));
      const matchesDept = (deptFilter === "All" || r.department === deptFilter);
      const matchesDate = (dateFilter === "" || r.date === dateFilter);

      let matchesStatus = true;
      if (statusFilter === "Present") {
        matchesStatus = r.status === "Present" || ["Working", "On Break", "Checked Out"].includes(r.attendanceState ?? "");
      } else if (statusFilter === "Absent") {
        matchesStatus = r.status === "Absent" || r.attendanceState === "Not Checked In";
      } else if (statusFilter === "Late") {
        matchesStatus = r.lateArrival === true || r.status === "Late";
      } else if (statusFilter === "Half Leave" || statusFilter === "Half Day") {
        matchesStatus = r.status === "Half Day" || r.status === "Half-Day" || r.status === "Half Leave" || r.status === "Leave" || ((r.workingHours ?? 0) > 0 && (r.workingHours ?? 0) < 5);
      }

      return matchesSearch && matchesDept && matchesDate && matchesStatus;
    });
  }, [liveData, search, statusFilter, deptFilter, dateFilter]);

  const departments = ["All", ...Array.from(new Set(liveData.map((a) => a.department || "Unknown")))];

  const exportCSV = () => {
    const headers = ["Employee ID", "Name", "Department", "Date", "Shift", "Check In", "Check In Location", "Check Out", "Check Out Location", "Hours", "Status", "Flags"];
    const csvRows = filteredRecords.map((r) => {
      const flags = [];
      if (r.lateArrival) flags.push("Late");
      if (r.isOvertime) flags.push("Overtime");
      if (r.source === "Offline") flags.push("Offline");
      const inLoc = r.location ? (r.location.name || `${r.location.latitude.toFixed(4)}, ${r.location.longitude.toFixed(4)}`) : "--";
      const outLoc = r.checkOutLocation ? (r.checkOutLocation.name || `${r.checkOutLocation.latitude.toFixed(4)}, ${r.checkOutLocation.longitude.toFixed(4)}`) : "--";
      return [r.employeeId, r.employeeName, r.department, r.date, r.shiftType || 'Regular', r.checkInTime || '--', inLoc, r.checkOutTime || '--', outLoc, r.workingHours ?? '--', r.status, flags.join(", ")];
    });
    const csv = [headers, ...csvRows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hr_attendance_report.csv";
    a.click();
  };

  return (    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "var(--text-h)", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
            <EventAvailable fontSize="large" sx={{ color: "var(--primary)" }} /> Global Attendance
          </Typography>
          <Typography sx={{ color: "var(--text-light)", mt: 1 }}>
            Monitor daily check-ins, tardiness, absence trends, and manage corrections across all departments.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button variant="outlined" startIcon={<DownloadForOffline />} onClick={exportCSV} sx={{ borderRadius: 2 }}>
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Interactive Summary KPI Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 2, mb: 4 }}>
        {STATUS_BUTTONS.map((item) => {
          const Icon = item.icon;
          const isSelected = statusFilter === item.id;
          const count = summaryCounts[item.id as keyof typeof summaryCounts] || 0;
          return (
            <Paper
              key={item.id}
              elevation={isSelected ? 4 : 0}
              onClick={() => setStatusFilter(item.id)}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: isSelected ? `2px solid ${item.color}` : "1px solid var(--border)",
                bgcolor: isSelected ? item.bg : "var(--surface)",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                display: "flex",
                flexDirection: "column",
                justify: "space-between",
                "&:hover": {
                  transform: "translateY(-2px)",
                  borderColor: item.color,
                  boxShadow: `0 4px 12px ${item.color}33`,
                },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography sx={{ color: isSelected ? item.color : "var(--text-light)", fontSize: 14, fontWeight: 600 }}>
                  {item.label}
                </Typography>
                <Icon sx={{ color: item.color, fontSize: 22 }} />
              </Box>
              <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <Typography sx={{ color: isSelected ? item.color : "var(--text-h)", fontSize: 32, fontWeight: 800 }}>
                  {count}
                </Typography>
                {isSelected && (
                  <Chip label="Active Filter" size="small" sx={{ bgcolor: item.color, color: "#fff", height: 20, fontSize: 10, fontWeight: 700 }} />
                )}
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* Correction Requests Module */}
      <Box sx={{ mb: 4 }}>
        <CorrectionRequests />
      </Box>

      {/* Status Filter Buttons Bar & Search / Date Controls */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
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
              {STATUS_BUTTONS.map((s) => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Department</InputLabel>
            <Select label="Department" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} sx={{ bgcolor: "var(--surface)" }}>
              {departments.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3, alignItems: "stretch", flexGrow: 1, mb: 4 }}>
        <Collapse in={showCalendar} orientation="horizontal" unmountOnExit sx={{ width: { xs: "100%", lg: "auto" }, transition: "width 0.4s cubic-bezier(0.25, 1, 0.5, 1)", '& .MuiCollapse-wrapper': { height: '100%' }, '& .MuiCollapse-wrapperInner': { height: '100%' } }}>
          <Box sx={{ width: { xs: "100%", lg: "340px" }, flexShrink: 0, height: '100%' }}>
            <AttendanceCalendar 
              records={liveData} 
              selectedDate={dateFilter} 
              onSelectDate={setDateFilter} 
            />
          </Box>
        </Collapse>

        <Box sx={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column" }}>
          <SmartAttendanceTable records={filteredRecords} role={(user?.role as any) || "HR"} />
        </Box>
      </Box>
    </Box>
  );
};

export default Attendance;