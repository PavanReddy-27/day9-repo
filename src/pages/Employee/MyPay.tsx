import { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Chip, Divider, Paper, CircularProgress, Grid, Button
} from '@mui/material';
import payrollApi, { PayrollRecord } from '../../services/payrollApi';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

export default function EmployeeMyPay() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyPay = async () => {
    try {
      setLoading(true);
      const data = await payrollApi.getMyPay();
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch pay records", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) {
        fetchMyPay();
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', mb: 3 }}>
        My Pay
      </Typography>

      {records.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ReceiptLongIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No Payroll Records Found</Typography>
          <Typography variant="body2" color="text.secondary">You don't have any generated pay slips yet.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {records.map((record) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={record._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {(record.periodId as any)?.name || 'Unknown Period'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: <Chip size="small" label={record.status} color={record.status === 'Approved' ? 'success' : 'default'} sx={{ ml: 1, height: 20 }} />
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">Net Pay</Typography>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                      ₹{record.netSalary.toFixed(2)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Base Salary</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>₹{record.baseSalary.toFixed(2)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Allowances</Typography>
                      <Typography variant="body1" color="success.main" sx={{ fontWeight: 500 }}>
                        +₹{((record.overtimeHours * 10) + record.shiftAllowance).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Deductions</Typography>
                      <Typography variant="body1" color="error.main" sx={{ fontWeight: 500 }}>
                        -₹{record.deductions.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Payable Days</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{record.payableDays} days</Typography>
                    </Grid>
                  </Grid>

                  {(record as any).adjustments && (record as any).adjustments.length > 0 && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                        Adjustments
                      </Typography>
                      {(record as any).adjustments.map((adj: any, i: number) => (
                        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption">{adj.reason}</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 500, color: adj.amount > 0 ? 'success.main' : 'error.main' }}>
                            {adj.amount > 0 ? '+' : ''}₹{adj.amount.toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
                <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={() => payrollApi.exportCsv((record as any).periodId?._id || record.periodId, 'me')}
                  >
                    CSV
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={() => payrollApi.exportJson((record as any).periodId?._id || record.periodId, 'me')}
                  >
                    JSON
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    fullWidth 
                    onClick={async () => {
                      const pId = (record as any).periodId?._id || record.periodId;
                      const pName = (record as any).periodId?.name || 'Period';
                      const data = await payrollApi.getExportData(pId, 'me');
                      const empData = Array.isArray(data) ? data[0] : data;
                      const { generatePayslipPdf } = await import('../../utils/pdfGenerator');
                      if (empData) generatePayslipPdf(empData, pName);
                    }}
                  >
                    PDF
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
