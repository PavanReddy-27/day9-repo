import { useState, useEffect } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from "@mui/material";
import { EventAvailable } from "@mui/icons-material";
import { attendanceApi } from "../../services/attendanceApi";
import type { AttendanceRecord } from "../../types/attendance";
import { useAppSelector } from "../../hooks/redux";
import TimeClock from "../../components/attendance/TimeClock";

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

  useEffect(() => {
    const fetchRecords = async () => {
      if (user) {
        const history = await attendanceApi.getEmployeeRecords(user.employeeId);
        // Sort descending by date
        setRecords(history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    };
    
    fetchRecords();
    
    // Poll for changes periodically to update history when they check in/out
    const interval = setInterval(fetchRecords, 2000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "var(--text-h)", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
            <EventAvailable fontSize="large" sx={{ color: "var(--primary)" }} /> My Attendance History
          </Typography>
          <Typography sx={{ color: "var(--text-light)", mt: 1 }}>
            Track your daily check-ins, check-outs, and total logged hours.
          </Typography>
        </Box>
        
        <Box>
          <TimeClock />
        </Box>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
        <Table>
          <TableHead>
            <TableRow>
              {["Date", "Check In", "Check Out", "Hours", "Status"].map((h) => (
                <TableCell key={h} sx={{ color: "var(--text-light)", fontWeight: 600, borderColor: "var(--border)" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length > 0 ? records.map((row) => (
              <TableRow key={row.id}>
                <TableCell sx={{ color: "var(--text-light)" }}>{row.date}</TableCell>
                <TableCell sx={{ color: "var(--text-h)", fontWeight: 600 }}>
                  {row.checkInTime ? new Date(row.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--"}
                </TableCell>
                <TableCell sx={{ color: "var(--text-h)", fontWeight: 600 }}>
                  {row.checkOutTime ? new Date(row.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--"}
                </TableCell>
                <TableCell sx={{ color: "var(--text-h)", fontWeight: 500 }}>
                  {row.workingHours ? `${row.workingHours}h` : "--"}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={row.status} 
                    size="small" 
                    sx={{ 
                      bgcolor: statusColors[row.status]?.bg || "#e0e0e0", 
                      color: statusColors[row.status]?.color || "#000", 
                      fontWeight: 600 
                    }} 
                  />
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 5, color: "var(--text-light)" }}>
                  No attendance records found. Start your first shift!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EmployeeAttendance;
