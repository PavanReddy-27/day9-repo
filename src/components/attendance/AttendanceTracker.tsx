import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, CircularProgress,
  Alert, Tooltip, Grow, Fade, FormControl, Select, MenuItem, InputLabel, IconButton,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { PlayArrow, Pause, Stop, Sync, LocationOn, AccessTime, WbSunny, NightsStay } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { checkIn, checkOut, startBreak, endBreak, fetchTodayRecord, queueOfflineAction, clearOfflineQueue } from '../../redux/attendanceSlice';
import { Location, ShiftType } from '../../types/attendance';
import { attendanceApi } from '../../services/attendanceApi';
import { getDistanceMeters, getOfficeLocation, MAX_GPS_ACCURACY_METERS, GEOFENCE_RADIUS_METERS } from '../../config/attendance';

const AttendanceTracker = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { todayRecord, loading, error } = useAppSelector(state => state.attendance);
  
  const [geoError, setGeoError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [shiftType, setShiftType] = useState<ShiftType>("Regular");
  const [workMode, setWorkMode] = useState<"Office" | "Work From Home">("Work From Home");
  const [isLocating, setIsLocating] = useState(false);
  const [wfhPrompt, setWfhPrompt] = useState<{ open: boolean, loc: Location | null }>({ open: false, loc: null });

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
    const handleSyncComplete = () => {
      if (user) dispatch(fetchTodayRecord(user.id));
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline_sync_complete', handleSyncComplete);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline_sync_complete', handleSyncComplete);
    };
  }, [dispatch, user]);

  if (user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'HR') {
    return null;
  }

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
          (err) => reject(err.code === err.TIMEOUT ? 'Location request timed out. Please try again.' : 'Unable to retrieve your location. Permission denied or unavailable.'),
          { timeout: 5000, enableHighAccuracy: false }
        );
      }
    });
  };

  const isIndiaCoordinates = (loc: Location): boolean => {
    return loc.latitude >= 6.0 && loc.latitude <= 37.5 && loc.longitude >= 68.0 && loc.longitude <= 97.5;
  };

  // Returns an error message if the reading fails geofence/accuracy checks, or null if it's valid.
  const validateGeofenceAndAccuracy = (loc: Location): string | null => {
    // Work From Home or any Indian location is acceptable for check-in!
    if (workMode === "Work From Home" || isIndiaCoordinates(loc)) {
      return null;
    }
    if (loc.accuracy != null && loc.accuracy > MAX_GPS_ACCURACY_METERS) {
      return `Your location signal is too weak (±${Math.round(loc.accuracy)}m accuracy). Move to an open area or wait for GPS to stabilize, then try again.`;
    }

    const policyType = user?.workMode || "Office";
    if (policyType === "Office" && workMode === "Office") {
      const officeLocation = getOfficeLocation();
      const distance = getDistanceMeters(loc, officeLocation);
      if (distance > GEOFENCE_RADIUS_METERS) {
        return `You are ${Math.round(distance)}m away from ${officeLocation.name}. Select 'Work From Home' if checking in remotely within India.`;
      }
    }
    return null;
  };

  const executeCheckIn = async (loc: Location, isWFH: boolean = false) => {
    const idempotencyKey = Math.random().toString(36).substr(2, 9);

    if (!isOnline) {
       dispatch(queueOfflineAction({ type: 'checkIn', location: loc, shiftType, idempotencyKey }));
       setGeoError("You are offline. Check-in queued for sync.");
       return;
    }

    if (user) {
      const resultAction = await dispatch(checkIn({
        employeeId: user.id,
        employeeName: user.fullName,
        location: loc,
        shiftType,
        department: user.department,
        idempotencyKey,
        isWFH
      }));
      
      if (checkIn.rejected.match(resultAction)) {
        if (resultAction.payload === "OUTSIDE_GEOFENCE" || resultAction.error.message?.includes("OUTSIDE_GEOFENCE")) {
           setWfhPrompt({ open: true, loc });
        } else {
           setGeoError(resultAction.payload as string || resultAction.error.message || "Check-in failed");
        }
      }
    }
  };

  const handleCheckIn = async () => {
    try {
      setGeoError(null);
      let loc = currentLocation;
      if (!loc) {
        setIsLocating(true);
        loc = await getLocation();
        setCurrentLocation(loc);
        setIsLocating(false);
      }

      const validationError = validateGeofenceAndAccuracy(loc);
      if (validationError) {
        setGeoError(validationError);
        return;
      }

      await executeCheckIn(loc, false);
    } catch (err) {
      setIsLocating(false);
      setGeoError(String(err));
    }
  };

  const handleCheckOut = async () => {
    if (!user) return;
    try {
      setGeoError(null);
      let loc = currentLocation;
      if (!loc) {
        setIsLocating(true);
        try {
          loc = await getLocation();
          setCurrentLocation(loc);
        } catch {
          // Use existing check-in location or default office coordinates if browser GPS is blocked/unavailable
          loc = todayRecord?.location || { latitude: 17.3850, longitude: 78.4867, name: "Office" };
        } finally {
          setIsLocating(false);
        }
      }

      await dispatch(checkOut({ employeeId: user.id || (user as any)._id, location: loc || todayRecord?.location }));
    } catch {
      setIsLocating(false);
      // Ensure checkOut dispatch still runs even if any error occurs
      dispatch(checkOut({ employeeId: user.id || (user as any)._id, location: todayRecord?.location }));
    }
  };

  const formatTime = (isoStr: string | null) => {
    if (!isoStr) return "--:--";
    return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLocationTooltip = (loc: Location) => {
    const distance = Math.round(getDistanceMeters(loc, getOfficeLocation()));
    const accStr = loc.accuracy != null ? ` · ±${Math.round(loc.accuracy)}m accuracy` : '';
    return `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}${accStr} · ${distance}m from office — View on map`;
  };

  const openInMaps = (loc: Location) => {
    window.open(`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`, '_blank', 'noopener,noreferrer');
  };

  if (!user) return null;

  const isCheckedIn = !!todayRecord && todayRecord.status !== 'Not Checked In' && !todayRecord.checkOutTime;
  const isOnBreak = !!todayRecord && todayRecord.status === 'On Break';
  const isCheckedOut = !!todayRecord && todayRecord.status === 'Checked Out';

  return (
    <>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 1 }}>
            {(error || geoError) && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
                {error && <Alert severity="error">{error}</Alert>}
                {geoError && <Alert severity="warning">{geoError}</Alert>}
              </Box>
            )}

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
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.25, mt: 0.5 }}>
                    {todayRecord?.location && (
                      <Tooltip title={formatLocationTooltip(todayRecord.location)}>
                        <IconButton
                          size="small"
                          onClick={() => openInMaps(todayRecord.location!)}
                          sx={{ p: 0.25, color: '#2563EB' }}
                        >
                          <LocationOn fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Typography variant="h6" sx={{ fontWeight: 700, color: todayRecord?.location ? '#2563EB' : "var(--text-h)" }}>{formatTime(todayRecord?.checkInTime || null)}</Typography>
                  </Box>
                  {todayRecord?.location && (
                    <Typography variant="caption" sx={{ color: "var(--text-light)", display: 'block', fontSize: '0.7rem', mt: 0.25 }}>
                      {todayRecord.location.latitude.toFixed(4)}, {todayRecord.location.longitude.toFixed(4)}
                    </Typography>
                  )}
               </Box>
               <Box sx={{ flex: 1, textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                  <Typography variant="caption" sx={{ color: "var(--text-light)" }}>Check Out</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.25, mt: 0.5 }}>
                    {todayRecord?.checkOutLocation && (
                      <Tooltip title={formatLocationTooltip(todayRecord.checkOutLocation)}>
                        <IconButton
                          size="small"
                          onClick={() => openInMaps(todayRecord.checkOutLocation!)}
                          sx={{ p: 0.25, color: '#2563EB' }}
                        >
                          <LocationOn fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Typography variant="h6" sx={{ fontWeight: 700, color: todayRecord?.checkOutLocation ? '#2563EB' : "var(--text-h)" }}>{formatTime(todayRecord?.checkOutTime || null)}</Typography>
                  </Box>
                  {todayRecord?.checkOutLocation && (
                    <Typography variant="caption" sx={{ color: "var(--text-light)", display: 'block', fontSize: '0.7rem', mt: 0.25 }}>
                      {todayRecord.checkOutLocation.latitude.toFixed(4)}, {todayRecord.checkOutLocation.longitude.toFixed(4)}
                    </Typography>
                  )}
               </Box>
               <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: "var(--text-light)" }}>Total Break</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, color: "var(--text-h)" }}>{todayRecord?.totalBreakDuration || 0}m</Typography>
               </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
            {!isCheckedIn && (
              <>
                <FormControl size="small" fullWidth sx={{ mb: 1 }}>
                  <InputLabel id="workmode-select-label" sx={{ color: "var(--text-light)" }}>Work Mode / Location</InputLabel>
                  <Select
                    labelId="workmode-select-label"
                    value={workMode}
                    label="Work Mode / Location"
                    onChange={(e) => setWorkMode(e.target.value as "Office" | "Work From Home")}
                    sx={{ color: "var(--text-h)", bgcolor: "var(--bg)", '& .MuiOutlinedInput-notchedOutline': { borderColor: "var(--border)" } }}
                  >
                    <MenuItem value="Work From Home">🏠 Work From Home (All India Locations)</MenuItem>
                    <MenuItem value="Office">🏢 Office Location (Geofenced)</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth sx={{ mb: 1 }}>
                  <InputLabel id="shift-select-label" sx={{ color: "var(--text-light)" }}>Select Shift</InputLabel>
                  <Select
                    labelId="shift-select-label"
                    value={shiftType}
                    label="Select Shift"
                    onChange={(e) => setShiftType(e.target.value as ShiftType)}
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
                  startIcon={(loading || isLocating) ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
                  onClick={handleCheckIn}
                  disabled={loading || isLocating}
                  fullWidth
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 3, 
                    bgcolor: 'var(--primary)', 
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 700,
                    transition: 'all 0.3s ease',
                    '&:hover': { bgcolor: 'var(--primary-light)', color: '#111827', transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(79, 70, 229, 0.3)' },
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
                  startIcon={(loading || isLocating) ? <CircularProgress size={20} color="inherit" /> : <Stop />}
                  onClick={handleCheckOut}
                  disabled={loading || isLocating}
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

      <Dialog open={wfhPrompt.open} onClose={() => setWfhPrompt({ open: false, loc: null })}>
        <DialogTitle>Outside Office Geofence</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are currently outside the required radius of the office location. Would you like to check in as "Work From Home" (WFH)?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWfhPrompt({ open: false, loc: null })} color="inherit">Cancel</Button>
          <Button onClick={() => {
            if (wfhPrompt.loc) executeCheckIn(wfhPrompt.loc, true);
            setWfhPrompt({ open: false, loc: null });
          }} variant="contained" color="primary">
            Check In as WFH
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AttendanceTracker;
