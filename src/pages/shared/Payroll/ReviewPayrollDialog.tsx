import { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField,
  Box, Typography
} from '@mui/material';
import payrollApi, { PayrollRecord } from '../../../services/payrollApi';

interface ReviewPayrollDialogProps {
  open: boolean;
  onClose: () => void;
  periodId: string;
}

export const ReviewPayrollDialog = ({ open, onClose, periodId }: ReviewPayrollDialogProps) => {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PayrollRecord>>({});

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await payrollApi.getRecordsForPeriod(periodId);
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    if (open && periodId) {
      Promise.resolve().then(() => {
        if (!ignore) {
          fetchRecords();
        }
      });
    }
    return () => {
      ignore = true;
    };
  }, [open, periodId]);

  const handleEditClick = (record: PayrollRecord) => {
    setEditingId(record._id);
    setEditForm({
      payableDays: record.payableDays,
      regularHours: record.regularHours,
      overtimeHours: record.overtimeHours,
      unpaidLeaveDays: record.unpaidLeaveDays,
      baseSalary: record.baseSalary,
      shiftAllowance: record.shiftAllowance,
      deductions: record.deductions
    });
  };

  const handleSaveClick = async (recordId: string) => {
    try {
      await payrollApi.adjustRecord(recordId, editForm);
      setEditingId(null);
      fetchRecords(); // refresh
    } catch (err) {
      console.error("Failed to update record", err);
      alert("Failed to update record");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>Review & Adjust Payroll Records</DialogTitle>
      <DialogContent>
        {loading ? <p>Loading records...</p> : records.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary" gutterBottom>No payroll records found for this period.</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>This usually happens if the period was created but records failed to generate.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2, maxHeight: '60vh' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: 'background.paper' }}>Employee</TableCell>
                  <TableCell sx={{ bgcolor: 'background.paper' }}>Payable Days</TableCell>
                  <TableCell sx={{ bgcolor: 'background.paper' }}>Regular Hrs</TableCell>
                  <TableCell sx={{ bgcolor: 'background.paper' }}>Overtime Hrs</TableCell>
                  <TableCell sx={{ bgcolor: 'background.paper' }}>Unpaid Leaves</TableCell>
                  <TableCell sx={{ bgcolor: 'background.paper' }}>Base Salary</TableCell>
                  <TableCell sx={{ bgcolor: 'background.paper' }}>Shift Allowance</TableCell>
                  <TableCell sx={{ bgcolor: 'background.paper' }}>Deductions</TableCell>
                  <TableCell sx={{ bgcolor: 'background.paper' }}>Net Salary</TableCell>
                  <TableCell sx={{ bgcolor: 'background.paper' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell>
                      {(row.employeeId as any)?.firstName} {(row.employeeId as any)?.lastName}
                    </TableCell>
                    
                    <TableCell>
                      {editingId === row._id ? (
                        <TextField size="small" type="number" value={editForm.payableDays} onChange={(e) => setEditForm({...editForm, payableDays: Number(e.target.value)})} />
                      ) : row.payableDays}
                    </TableCell>

                    <TableCell>
                      {editingId === row._id ? (
                        <TextField size="small" type="number" value={editForm.regularHours} onChange={(e) => setEditForm({...editForm, regularHours: Number(e.target.value)})} />
                      ) : row.regularHours}
                    </TableCell>

                    <TableCell>
                      {editingId === row._id ? (
                        <TextField size="small" type="number" value={editForm.overtimeHours} onChange={(e) => setEditForm({...editForm, overtimeHours: Number(e.target.value)})} />
                      ) : row.overtimeHours}
                    </TableCell>

                    <TableCell>
                      {editingId === row._id ? (
                        <TextField size="small" type="number" value={editForm.unpaidLeaveDays} onChange={(e) => setEditForm({...editForm, unpaidLeaveDays: Number(e.target.value)})} />
                      ) : row.unpaidLeaveDays}
                    </TableCell>

                    <TableCell>
                      {editingId === row._id ? (
                        <TextField size="small" type="number" value={editForm.baseSalary} onChange={(e) => setEditForm({...editForm, baseSalary: Number(e.target.value)})} />
                      ) : `₹${row.baseSalary}`}
                    </TableCell>

                    <TableCell>
                      {editingId === row._id ? (
                        <TextField size="small" type="number" value={editForm.shiftAllowance} onChange={(e) => setEditForm({...editForm, shiftAllowance: Number(e.target.value)})} />
                      ) : `₹${row.shiftAllowance}`}
                    </TableCell>

                    <TableCell>
                      {editingId === row._id ? (
                        <TextField size="small" type="number" value={editForm.deductions} onChange={(e) => setEditForm({...editForm, deductions: Number(e.target.value)})} />
                      ) : `₹${row.deductions}`}
                    </TableCell>

                    <TableCell>
                      <strong>₹{row.netSalary?.toFixed(2) || '0.00'}</strong>
                    </TableCell>

                    <TableCell sx={{ display: 'flex', gap: 1 }}>
                      {editingId === row._id ? (
                        <Button variant="contained" size="small" onClick={() => handleSaveClick(row._id)}>Save</Button>
                      ) : (
                        <Button variant="outlined" size="small" onClick={() => handleEditClick(row)} disabled={row.status === 'Approved'}>Edit</Button>
                      )}
                      <Button 
                        variant="outlined" 
                        size="small" 
                        color="secondary"
                        onClick={() => alert(`Payslip sent to ${(row.employeeId as any)?.firstName} ${(row.employeeId as any)?.lastName}`)}
                      >
                        Send
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
