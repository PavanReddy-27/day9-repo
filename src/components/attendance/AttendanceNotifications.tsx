import { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';

export const AttendanceNotifications = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<"success" | "info" | "warning" | "error">("info");

  useEffect(() => {
    const handleNotification = (e: Event) => {
       const detail = (e as CustomEvent).detail;
       if (detail && detail.message) {
         setMessage(detail.message);
         setSeverity(detail.severity || "info");
         setOpen(true);
       } else {
         setMessage("Attendance records have been updated.");
         setSeverity("info");
         setOpen(true);
       }
    };
    
    const handleCorrections = () => {
       setMessage("Correction request status updated.");
       setSeverity("success");
       setOpen(true);
    };

    window.addEventListener('attendance_updated', handleNotification);
    window.addEventListener('corrections_updated', handleCorrections);
    window.addEventListener('attendance_suspicious', handleNotification);
    window.addEventListener('attendance_late', handleNotification);
    window.addEventListener('attendance_overtime', handleNotification);
    
    return () => {
      window.removeEventListener('attendance_updated', handleNotification);
      window.removeEventListener('corrections_updated', handleCorrections);
      window.removeEventListener('attendance_suspicious', handleNotification);
      window.removeEventListener('attendance_late', handleNotification);
      window.removeEventListener('attendance_overtime', handleNotification);
    };
  }, []);

  return (
    <Snackbar 
      open={open} 
      autoHideDuration={6000} 
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={() => setOpen(false)} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AttendanceNotifications;
