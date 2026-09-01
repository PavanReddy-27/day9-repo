import { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  CircularProgress, 
  Chip,
  Button
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import payrollApi, { PayrollRecord } from "../../../services/payrollApi";

import { useAppSelector } from "../../../hooks/redux";
import { ReviewPayrollDialog } from "./ReviewPayrollDialog";

const MyPay = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  
  const isAdminView = user?.role === "Admin" || user?.role === "HR" || user?.role === "Manager";

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAdminView) {
          const data = await payrollApi.getPayrollPeriods();
          setPeriods(data);
        } else {
          const data = await payrollApi.getMyPay();
          setRecords(data);
        }
      } catch (err) {
        console.error("Failed to fetch payroll", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdminView]);

  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    try {
      setIsCalculating(true);
      const now = new Date();
      await payrollApi.calculatePayroll({
        // @ts-ignore
        companyId: user?.companyId || "",
        name: `Payroll ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`,
        startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
      });
      const data = await payrollApi.getPayrollPeriods();
      setPeriods(data);
      alert("Payroll calculated successfully!");
    } catch(err: any) {
      console.error(err);
      alert(err.message || "Failed to calculate payroll");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleLock = async (periodId: string) => {
    if (!window.confirm("Lock this payroll period? Records will be marked Approved.")) return;
    try {
      await payrollApi.lockPeriod(periodId, user?.id || "");
      const data = await payrollApi.getPayrollPeriods();
      setPeriods(data);
    } catch(err: any) {
      console.error(err);
      alert("Lock failed: " + (err?.message || "Unknown error"));
    }
  };

  const handleUnlock = async (periodId: string) => {
    if (!window.confirm("Unlock this payroll period? Status will revert to Draft.")) return;
    try {
      await payrollApi.unlockPeriod(periodId, user?.id || "");
      const data = await payrollApi.getPayrollPeriods();
      setPeriods(data);
    } catch(err: any) {
      console.error(err);
      alert("Unlock failed: " + (err?.message || "Unknown error"));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isAdminView) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>Payroll Management</Typography>
            <Typography variant="body1" color="text.secondary">Manage and process company payroll.</Typography>
          </Box>
          <Button variant="contained" onClick={handleCalculate} disabled={isCalculating}>
            {isCalculating ? "Calculating..." : "Calculate Current Month"}
          </Button>
        </Box>

        {periods.length === 0 ? (
          <Card><CardContent><Typography align="center" color="text.secondary">No payroll periods found.</Typography></CardContent></Card>
        ) : (
          <Grid container spacing={3}>
            {periods.map(period => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={period._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{period.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Chip label={period.status} color={period.status === "Locked" ? "success" : "warning"} size="small" />
                    </Box>
                  </CardContent>
                  <Box sx={{ p: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button 
                      variant="outlined" size="small"
                      onClick={() => setSelectedPeriodId(period._id)}
                    >
                      Review
                    </Button>
                    <Button 
                      variant="outlined" size="small"
                      onClick={() => payrollApi.exportCsv(period._id)}
                      startIcon={<DownloadIcon />}
                    >
                      Export CSV
                    </Button>
                    <Button 
                      variant="outlined" size="small"
                      onClick={() => payrollApi.exportJson(period._id)}
                      startIcon={<DownloadIcon />}
                    >
                      Export JSON
                    </Button>
                    <Button
                      variant="contained" size="small" color="primary"
                      startIcon={<DownloadIcon />}
                      onClick={async () => {
                        const data = await payrollApi.getExportData(period._id);
                        const { generateAllPayslipsPdf } = await import('../../../utils/pdfGenerator');
                        generateAllPayslipsPdf(data, period.name);
                      }}
                    >
                      PDF Payslips
                    </Button>
                    {period.status !== "Locked" ? (
                      <Button variant="contained" size="small" color="error" onClick={() => handleLock(period._id)}>
                        Lock
                      </Button>
                    ) : (
                      <Button variant="outlined" size="small" color="warning" onClick={() => handleUnlock(period._id)}>
                        Unlock
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        <ReviewPayrollDialog 
          open={!!selectedPeriodId} 
          onClose={() => setSelectedPeriodId(null)} 
          periodId={selectedPeriodId || ""} 
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        My Pay
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View your payroll history and download payslips.
      </Typography>

      {records.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" align="center">
              No payroll records found.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {records.map((record) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={record._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {record.periodId?.name || "Unknown Period"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: <Chip label={record.status} size="small" color={record.status === "Approved" ? "success" : "default"} />
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main' }}>
                      <AttachMoneyIcon />
                    </Box>
                  </Box>

                  <Box sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">Net Pay</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      ₹{record.netSalary.toFixed(2)}
                    </Typography>
                  </Box>

                  <Grid container spacing={2} sx={{ mt: 1, borderTop: 1, borderColor: 'divider', pt: 2 }}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Base Salary</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>₹{record.baseSalary.toFixed(2)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Overtime / Shift</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        ₹{((record.overtimeHours * 10) + record.shiftAllowance).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Deductions</Typography>
                      <Typography variant="body1" color="error.main" sx={{ fontWeight: 500 }}>-₹{record.deductions.toFixed(2)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Payable Days</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{record.payableDays} Days</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<DownloadIcon />}
                    onClick={() => payrollApi.exportCsv(record.periodId._id)}
                  >
                    CSV
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<DownloadIcon />}
                    onClick={() => payrollApi.exportJson(record.periodId._id)}
                  >
                    JSON
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MyPay;
