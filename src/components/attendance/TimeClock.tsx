import { useState, useEffect, useCallback } from "react";
import { Box, Button, Typography, Paper, CircularProgress, Snackbar, Alert, Chip } from "@mui/material";
import { attendanceApi } from "../../services/attendanceApi";
import type { AttendanceRecord } from "../../types/attendance";
import { useAppSelector } from "../../hooks/redux";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const TimeClock = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState({ open: false, message: "", severity: "success" as "success" | "error" | "info" });

  const fetchTodayRecord = useCallback(async () => {
    if (user) {
      try {
        const todayRecord = await attendanceApi.getTodayRecord(user.id);
        setRecord(todayRecord);
      } catch (error) {
        console.error("Error fetching record", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTodayRecord();

    const handleUpdate = () => {
      fetchTodayRecord();
    };

    window.addEventListener("attendance_updated", handleUpdate);
    return () => {
      window.removeEventListener("attendance_updated", handleUpdate);
    };
  }, [fetchTodayRecord]);

  const handleCheckIn = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const newRecord = await attendanceApi.checkIn(user.id, user.fullName, undefined, "Web", "Regular", undefined, user.department);
      setRecord(newRecord);
      setToastMsg({ open: true, message: "Successfully checked in!", severity: "success" });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to check in";
      setToastMsg({ open: true, message: msg, severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartBreak = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const updatedRecord = await attendanceApi.startBreak(user.id);
      setRecord(updatedRecord);
      setToastMsg({ open: true, message: "Break started.", severity: "info" });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to start break";
      setToastMsg({ open: true, message: msg, severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeWork = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const updatedRecord = await attendanceApi.endBreak(user.id);
      setRecord(updatedRecord);
      setToastMsg({ open: true, message: "Resumed work.", severity: "success" });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to resume work";
      setToastMsg({ open: true, message: msg, severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const updatedRecord = await attendanceApi.checkOut(user.id);
      setRecord(updatedRecord);
      setToastMsg({ open: true, message: `Checked out successfully! Total worked hours: ${updatedRecord.workingHours ?? 0} hrs`, severity: "success" });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to check out";
      setToastMsg({ open: true, message: msg, severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>
        <CircularProgress size={24} />
      </Paper>
    );
  }

  const isCheckedIn = !!record && !record.checkOutTime;
  const isOnBreak = isCheckedIn && !!record.breakStartTime;
  const isCheckedOut = !!record && !!record.checkOutTime;

  return (
    <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2, minWidth: 320, justifyContent: 'space-between', flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccessTimeIcon color="primary" />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", lineHeight: 1.2 }}>
            Time Clock
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.role || "Employee"} • {user?.department || "General"}
          </Typography>
        </Box>
      </Box>

      {!record ? (
        <Button
          variant="contained"
          color="success"
          startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
          onClick={handleCheckIn}
          disabled={actionLoading}
          disableElevation
        >
          Check In
        </Button>
      ) : isCheckedIn ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Chip 
            label={isOnBreak ? "On Break" : "Checked In"} 
            color={isOnBreak ? "warning" : "success"} 
            size="small" 
            variant="outlined" 
            sx={{ fontWeight: "bold" }}
          />

          {!isOnBreak ? (
            <Button
              variant="outlined"
              color="warning"
              size="small"
              startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : <PauseIcon />}
              onClick={handleStartBreak}
              disabled={actionLoading}
            >
              Break
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : <PlayArrowIcon />}
              onClick={handleResumeWork}
              disabled={actionLoading}
            >
              Resume
            </Button>
          )}

          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : <StopIcon />}
            onClick={handleCheckOut}
            disabled={actionLoading}
            disableElevation
          >
            Check Out
          </Button>
        </Box>
      ) : isCheckedOut ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label="Shift Complete" color="default" size="small" />
          <Typography variant="body2" color="text.primary" sx={{ fontWeight: "bold" }}>
            {record.workingHours ?? 0} hrs
          </Typography>
        </Box>
      ) : (
        <Button
          variant="contained"
          color="success"
          startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
          onClick={handleCheckIn}
          disabled={actionLoading}
          disableElevation
        >
          Check In
        </Button>
      )}

      <Snackbar 
        open={toastMsg.open} 
        autoHideDuration={5000} 
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
