import { useState, useEffect } from "react";
import { Box, Button, Typography, Paper, CircularProgress, Snackbar, Alert } from "@mui/material";
import { attendanceApi } from "../../services/attendanceApi";
import type { AttendanceRecord } from "../../types/attendance";
import { useAppSelector } from "../../hooks/redux";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const TimeClock = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  useEffect(() => {
    const fetchTodayRecord = async () => {
      if (user) {
        try {
          const todayRecord = await attendanceApi.getTodayRecord(user.employeeId);
          setRecord(todayRecord);
        } catch (error) {
          console.error("Error fetching record", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchTodayRecord();
  }, [user]);

  const handleCheckIn = async () => {
    if (!user) return;
    try {
      const newRecord = await attendanceApi.checkIn(user.employeeId, user.fullName);
      setRecord(newRecord);
      setToastMsg({ open: true, message: "Successfully checked in for today!", severity: "success" });
    } catch (error: any) {
      setToastMsg({ open: true, message: error.message || "Failed to check in", severity: "error" });
    }
  };

  const handleCheckOut = async () => {
    if (!user) return;
    try {
      const updatedRecord = await attendanceApi.checkOut(user.employeeId);
      setRecord(updatedRecord);
      setToastMsg({ open: true, message: `Checked out successfully. Hours logged: ${updatedRecord.workingHours}`, severity: "success" });
    } catch (error: any) {
      setToastMsg({ open: true, message: error.message || "Failed to check out", severity: "error" });
    }
  };

  if (loading) {
    return <CircularProgress size={24} />;
  }

  return (
    <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2, minWidth: 300, justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccessTimeIcon color="primary" />
        <Typography variant="subtitle1" fontWeight="bold">
          Today's Shift
        </Typography>
      </Box>

      {!record ? (
        <Button
          variant="contained"
          color="success"
          startIcon={<PlayArrowIcon />}
          onClick={handleCheckIn}
          disableElevation
        >
          Check In
        </Button>
      ) : !record.checkOutTime ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="success.main" fontWeight="bold">
            🟢 Checked In
          </Typography>
          <Button
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            onClick={handleCheckOut}
            disableElevation
          >
            Check Out
          </Button>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" fontWeight="bold">
          Shift Complete ({record.workingHours} hrs)
        </Typography>
      )}
      <Snackbar 
        open={toastMsg.open} 
        autoHideDuration={6000} 
        onClose={() => setToastMsg({ ...toastMsg, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastMsg({ ...toastMsg, open: false })} severity={toastMsg.severity} sx={{ width: '100%' }}>
          {toastMsg.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default TimeClock;
