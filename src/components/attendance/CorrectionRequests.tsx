import { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, TextField, Dialog, 
  DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import { useAppSelector } from '../../hooks/redux';
import { attendanceApi } from '../../services/attendanceApi';
import { CorrectionRequest } from '../../types/attendance';

export const CorrectionRequests = () => {
  const { user } = useAppSelector(state => state.auth);
  const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ recordId: '', checkIn: '', checkOut: '', reason: '' });
  
  // Manager Approval State
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedCorrection, setSelectedCorrection] = useState<CorrectionRequest | null>(null);
  const [managerComment, setManagerComment] = useState('');

  const loadData = useCallback(async () => {
    if (!user) return;
    if (user.role === 'Employee') {
      const data = await attendanceApi.getMyCorrections(user.id);
      setCorrections(data);
    } else {
      const data = await attendanceApi.getPendingCorrections(user.department);
      setCorrections(data);
    }
  }, [user]);

  useEffect(() => {
    loadData();
    window.addEventListener('corrections_updated', loadData);
    return () => window.removeEventListener('corrections_updated', loadData);
  }, [loadData]);

  const handleSubmit = async () => {
    if (!user) return;
    await attendanceApi.submitCorrection({
      recordId: form.recordId,
      employeeId: user.id,
      employeeName: user.fullName,
      requestedCheckIn: form.checkIn || null,
      requestedCheckOut: form.checkOut || null,
      reason: form.reason
    });
    setOpen(false);
    setForm({ recordId: '', checkIn: '', checkOut: '', reason: '' });
  };

  const handleReview = async (status: "Approved" | "Rejected") => {
    if (selectedCorrection) {
       await attendanceApi.reviewCorrection(selectedCorrection.id, status, managerComment);
       setReviewOpen(false);
       setSelectedCorrection(null);
       setManagerComment('');
    }
  };

  if (!user) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--text-h)" }}>
          {user.role === 'Employee' ? 'My Correction Requests' : 'Pending Approvals'}
        </Typography>
        {user.role === 'Employee' && (
          <Button variant="contained" size="small" onClick={() => setOpen(true)} sx={{ borderRadius: 2, textTransform: 'none' }}>
            Request Correction
          </Button>
        )}
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid var(--border)", borderRadius: 2, bgcolor: "var(--surface)" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date/Record ID</TableCell>
              {user.role !== 'Employee' && <TableCell>Employee</TableCell>}
              <TableCell>Req. Check In</TableCell>
              <TableCell>Req. Check Out</TableCell>
              <TableCell>Status</TableCell>
              {user.role !== 'Employee' && <TableCell>Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {corrections.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No requests found.</TableCell></TableRow>
            ) : (
              corrections.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.recordId}</TableCell>
                  {user.role !== 'Employee' && <TableCell>{c.employeeName}</TableCell>}
                  <TableCell>{c.requestedCheckIn || '-'}</TableCell>
                  <TableCell>{c.requestedCheckOut || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={c.status} 
                      size="small" 
                      color={c.status === 'Approved' ? 'success' : c.status === 'Rejected' ? 'error' : 'warning'} 
                    />
                  </TableCell>
                  {user.role !== 'Employee' && (
                    <TableCell>
                      <Button size="small" onClick={() => { setSelectedCorrection(c); setReviewOpen(true); }}>Review</Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Request Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Attendance Correction</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Record ID (Date or ID)" size="small" value={form.recordId} onChange={e => setForm({...form, recordId: e.target.value})} />
          <TextField label="Requested Check In Time (ISO/Time)" size="small" value={form.checkIn} onChange={e => setForm({...form, checkIn: e.target.value})} />
          <TextField label="Requested Check Out Time (ISO/Time)" size="small" value={form.checkOut} onChange={e => setForm({...form, checkOut: e.target.value})} />
          <TextField label="Reason" size="small" multiline rows={3} value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Review Request</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Typography variant="body2">Reason: {selectedCorrection?.reason}</Typography>
          <TextField label="Manager Comment" size="small" multiline rows={2} value={managerComment} onChange={e => setManagerComment(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleReview("Rejected")} color="error">Reject</Button>
          <Button variant="contained" onClick={() => handleReview("Approved")} color="success">Approve</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default CorrectionRequests;
