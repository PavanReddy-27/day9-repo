import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, CircularProgress, 
  Alert, Tooltip, Grow, Fade, FormControl, Select, MenuItem, InputLabel 
} from '@mui/material';
import { PlayArrow, Pause, Stop, Sync, LocationOn, AccessTime, WbSunny, NightsStay } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { checkIn, checkOut, startBreak, endBreak, fetchTodayRecord, queueOfflineAction, clearOfflineQueue } from '../../redux/attendanceSlice';
import { Location } from '../../types/attendance';
import { attendanceApi } from '../../services/attendanceApi';

// Office coords for geofencing demo (e.g. some downtown location)
const OFFICE_COORDS = { latitude: 37.7749, longitude: -122.4194 };
const MAX_RADIUS_METERS = 500; 

// Haversine distance
const getDistance = (loc1: Location, loc2: { latitude: number; longitude: number }) => {
  const R = 6371e3; // metres
  const φ1 = loc1.latitude * Math.PI/180;
  const φ2 = loc2.latitude * Math.PI/180;
  const Δφ = (loc2.latitude-loc1.latitude) * Math.PI/180;
  const Δλ = (loc2.longitude-loc1.longitude) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const AttendanceTracker = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { todayRecord, loading, error, offlineQueue } = useAppSelector(state => state.attendance);
  
  const [geoError, setGeoError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [shiftType, setShiftType] = useState<"Regular" | "Flexible" | "Night" | "CrossMidnight">("Regular");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      dispatch(fetchTodayRecord(user.id));
    }
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch, user]);

  useEffect(() => {
    const syncOfflineData = async () => {
      if (user && offlineQueue.length > 0) {
        for (const action of offlineQueue) {
          if (action.type === 'checkIn') {
            await attendanceApi.checkIn(user.id, user.fullName, action.location, 'Offline', action.shiftType, action.idempotencyKey, user.department);
          }
        }
        dispatch(clearOfflineQueue());
        dispatch(fetchTodayRecord(user.id));
      }
    };

    if (isOnline && offlineQueue.length > 0) {
       syncOfflineData();
    }
  }, [isOnline, offlineQueue, user, dispatch]);

  const getLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported by your browser');
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }),
          () => reject('Unable to retrieve your location. Permission denied.')
        );
      }
    });
  };

  const handleCheckIn = async () => {
    try {
      setGeoError(null);
      let loc = currentLocation;
      if (!loc) {
        loc = await getLocation();
        setCurrentLocation(loc);
      }
      
      const distance = getDistance(loc, OFFICE_COORDS);
      if (distance > MAX_RADIUS_METERS) {
        console.warn(`User is ${Math.round(distance)}m away from office.`);
      }

      const idempotencyKey = Math.random().toString(36).substr(2, 9);
      
      if (!isOnline) {
         dispatch(queueOfflineAction({ type: 'checkIn', location: loc, shiftType, idempotencyKey }));
         setGeoError("You are offline. Check-in queued for sync.");
         return;
      }

      if (user) {
        dispatch(checkIn({
          employeeId: user.id,
          employeeName: user.fullName,
          location: loc,
          shiftType,
          department: user.department,
          idempotencyKey
        }));
      }
    } catch (err) {
      setGeoError(String(err));
    }
  };

  const formatTime = (isoStr: string | null) => {
    if (!isoStr) return "--:--";
    return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return null;

  const isCheckedIn = !!todayRecord && !todayRecord.checkOutTime;
  const isOnBreak = isCheckedIn && !!todayRecord.breakStartTime;
  const isCheckedOut = !!todayRecord && !!todayRecord.checkOutTime;

  return (
    <Grow in={true} timeout={800}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, md: 4 }, 
          borderRadius: 4, 
          bgcolor: "var(--surface)",
          border: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 32px -8px rgba(0, 0, 0, 0.1)",
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { xs: 'stretch', lg: 'center' },
          justifyContent: 'space-between',
          gap: 4
        }}
      >
        {/* Decorative subtle accent */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, var(--primary), var(--primary-light))" }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flex: '1 1 auto', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "var(--primary)", textTransform: 'uppercase', letterSpacing: 1.2, display: 'flex', alignItems: 'center', gap: 1 }}>
              {currentTime.getHours() > 18 || currentTime.getHours() < 6 ? <NightsStay fontSize="small" /> : <WbSunny fontSize="small" />} 
              Smart Attendance {todayRecord?.shiftType ? `- ${todayRecord.shiftType} Shift` : ''}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: "var(--text-h)" }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--text-light)", mt: 0.5, fontWeight: 500 }}>
              {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 } }}>
            {!isOnline && (
              <Tooltip title="Offline Mode: Actions will sync when connection returns">
                <Box sx={{ p: 1, bgcolor: 'rgba(255,152,0,0.1)', borderRadius: 2, color: '#ff9800', display: 'flex' }}>
                  <Sync className="spin-animation" />
                </Box>
              </Tooltip>
            )}
            {currentLocation && (
              <Tooltip title={`Location: ${currentLocation.latitude.toFixed(2)}, ${currentLocation.longitude.toFixed(2)}`}>
                <Box sx={{ p: 1, bgcolor: 'rgba(76,175,80,0.1)', borderRadius: 2, color: '#4caf50', display: 'flex' }}>
                  <LocationOn />
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flex: '2 1 auto', flexDirection: { xs: 'column', md: 'row' }, gap: 3, position: 'relative', zIndex: 1, width: '100%' }}>
          {(error || geoError) ? (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {error && <Alert severity="error">{error}</Alert>}
              {geoError && <Alert severity="warning">{geoError}</Alert>}
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flex: 1,
              p: 2,
              bgcolor: 'var(--bg)',
              borderRadius: 3,
              border: '1px solid var(--border)'
            }}>
               <Box sx={{ flex: 1, textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                  <Typography variant="caption" sx={{ color: "var(--text-light)", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <AccessTime fontSize="inherit" /> Check In
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, color: "var(--text-h)" }}>{formatTime(todayRecord?.checkInTime || null)}</Typography>
               </Box>
               <Box sx={{ flex: 1, textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                  <Typography variant="caption" sx={{ color: "var(--text-light)" }}>Check Out</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, color: "var(--text-h)" }}>{formatTime(todayRecord?.checkOutTime || null)}</Typography>
               </Box>
               <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: "var(--text-light)" }}>Total Break</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, color: "var(--text-h)" }}>{todayRecord?.totalBreakDuration || 0}m</Typography>
               </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
            {!isCheckedIn && !isCheckedOut && (
              <>
                <FormControl size="small" fullWidth sx={{ mb: 1 }}>
                  <InputLabel id="shift-select-label" sx={{ color: "var(--text-light)" }}>Select Shift</InputLabel>
                  <Select
                    labelId="shift-select-label"
                    value={shiftType}
                    label="Select Shift"
                    onChange={(e) => setShiftType(e.target.value as any)}
                    sx={{ color: "var(--text-h)", bgcolor: "var(--bg)", '& .MuiOutlinedInput-notchedOutline': { borderColor: "var(--border)" } }}
                  >
                    <MenuItem value="Regular">Regular (9AM - 5PM)</MenuItem>
                    <MenuItem value="Flexible">Flexible</MenuItem>
                    <MenuItem value="Night">Night Shift</MenuItem>
                    <MenuItem value="CrossMidnight">Cross-Midnight</MenuItem>
                  </Select>
                </FormControl>
                <Button 
                  variant="contained" 
                  size="large" 
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
                  onClick={handleCheckIn}
                  disabled={loading}
                  fullWidth
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 3, 
                    bgcolor: 'var(--primary)', 
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 700,
                    transition: 'all 0.3s ease',
                    '&:hover': { bgcolor: 'var(--primary-hover)', transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(15,118,110,0.3)' },
                    '&:active': { transform: 'translateY(0)' }
                  }}
                >
                  Check In Now
                </Button>
              </>
            )}

            {isCheckedIn && !isOnBreak && (
              <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                <Button 
                  variant="outlined" 
                  startIcon={<Pause />}
                  onClick={() => dispatch(startBreak(user.id))}
                  disabled={loading}
                  sx={{ 
                    flex: 1, 
                    py: 1.5, 
                    borderRadius: 3, 
                    color: '#ed6c02',
                    borderColor: '#ed6c02',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    '&:hover': { bgcolor: 'rgba(237,108,2,0.1)', borderColor: '#e65100', transform: 'translateY(-2px)' }
                  }}
                >
                  Break
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<Stop />}
                  onClick={() => dispatch(checkOut(user.id))}
                  disabled={loading}
                  sx={{ 
                    flex: 1, 
                    py: 1.5, 
                    borderRadius: 3, 
                    bgcolor: '#d32f2f', 
                    color: '#fff',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    '&:hover': { bgcolor: '#c62828', transform: 'translateY(-2px)' }
                  }}
                >
                  Check Out
                </Button>
              </Box>
            )}

            {isOnBreak && (
              <Button 
                variant="contained" 
                startIcon={<PlayArrow />}
                onClick={() => dispatch(endBreak(user.id))}
                disabled={loading}
                fullWidth
                sx={{ 
                  py: 1.5, 
                  borderRadius: 3, 
                  bgcolor: 'var(--primary)', 
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  transition: 'all 0.3s ease',
                  '&:hover': { bgcolor: 'var(--primary-hover)', transform: 'translateY(-2px)' }
                }}
              >
                Resume Work
              </Button>
            )}

            {isCheckedOut && (
              <Fade in={true} timeout={1000}>
                <Typography variant="body1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', p: 2, bgcolor: 'rgba(76,175,80,0.1)', borderRadius: 3, border: '1px solid rgba(76,175,80,0.2)', color: '#2e7d32', textAlign: 'center' }}>
                   ✓ Great job, {user?.fullName?.split(' ')[0] || 'Employee'}! Shift completed.
                </Typography>
              </Fade>
            )}
          </Box>
        </Box>
      </Paper>
    </Grow>
  );
};

export default AttendanceTracker;
