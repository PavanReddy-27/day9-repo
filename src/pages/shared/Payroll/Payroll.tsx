import { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  CircularProgress, 
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Divider
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import payrollApi, { PayrollRecord } from "../../../services/payrollApi";

import { useAppSelector } from "../../../hooks/redux";
import { ReviewPayrollDialog } from "./ReviewPayrollDialog";

// Helper: list of months
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Generate last 5 years + current
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

const MyPay = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  
  // Calculate dialog state
  const [calcOpen, setCalcOpen] = useState(false);
  const [calcMode, setCalcMode] = useState<"month" | "custom">("month");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

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

  const handleCalculate = async () => {
    let startDate: string;
    let endDate: string;
    let name: string;

    if (calcMode === "month") {
      const start = new Date(selectedYear, selectedMonth, 1);
      const end = new Date(selectedYear, selectedMonth + 1, 0);
      startDate = start.toISOString();
      endDate = end.toISOString();
      name = `Payroll ${MONTHS[selectedMonth]} ${selectedYear}`;
    } else {
      if (!customFrom || !customTo) {
        alert("Please select both From and To dates.");
        return;
      }
      if (new Date(customTo) < new Date(customFrom)) {
        alert("To date must be after From date.");
        return;
      }
      startDate = new Date(customFrom).toISOString();
      endDate = new Date(customTo).toISOString();
      const fromLabel = new Date(customFrom).toLocaleDateString("en-IN");
      const toLabel = new Date(customTo).toLocaleDateString("en-IN");
      name = `Payroll ${fromLabel} - ${toLabel}`;
    }

    try {
      setIsCalculating(true);
      await payrollApi.calculatePayroll({
        companyId: (user as any)?.companyId || "",
        name,
        startDate,
        endDate,
      });
      const data = await payrollApi.getPayrollPeriods();
      setPeriods(data);
      setCalcOpen(false);
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
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>Payroll Management</Typography>
            <Typography variant="body1" color="text.secondary">Manage and process company payroll.</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<CalendarMonthIcon />}
            onClick={() => setCalcOpen(true)}
          >
            Calculate Payroll
          </Button>
        </Box>

        {/* Payroll Periods */}
        {periods.length === 0 ? (
          <Card><CardContent><Typography align="center" color="text.secondary">No payroll periods found. Click "Calculate Payroll" to generate one.</Typography></CardContent></Card>
        ) : (
          <Grid container spacing={3}>
            {periods.map(period => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={period._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{period.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {new Date(period.startDate).toLocaleDateString("en-IN")} &rarr; {new Date(period.endDate).toLocaleDateString("en-IN")}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={period.status} color={period.status === "Locked" ? "success" : "warning"} size="small" />
                    </Box>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button variant="outlined" size="small" onClick={() => setSelectedPeriodId(period._id)}>
                      Review
                    </Button>
                    <Button variant="outlined" size="small" onClick={() => payrollApi.exportCsv(period._id)} startIcon={<DownloadIcon />}>
                      CSV
                    </Button>
                    <Button variant="outlined" size="small" onClick={() => payrollApi.exportJson(period._id)} startIcon={<DownloadIcon />}>
                      JSON
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
                      PDF
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

        {/* ── Calculate Payroll Dialog ── */}
        <Dialog open={calcOpen} onClose={() => setCalcOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>
            <CalendarMonthIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
            Calculate Payroll
          </DialogTitle>
          <DialogContent dividers>
            {/* Mode toggle */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Button
                variant={calcMode === "month" ? "contained" : "outlined"}
                size="small"
                onClick={() => setCalcMode("month")}
              >
                By Month
              </Button>
              <Button
                variant={calcMode === "custom" ? "contained" : "outlined"}
                size="small"
                onClick={() => setCalcMode("custom")}
              >
                Custom Date Range
              </Button>
            </Box>

            {calcMode === "month" ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    label="Month"
                    fullWidth
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  >
                    {MONTHS.map((m, i) => (
                      <MenuItem key={m} value={i}>{m}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    label="Year"
                    fullWidth
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  >
                    {YEARS.map(y => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">Period Name Preview:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Payroll {MONTHS[selectedMonth]} {selectedYear}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(selectedYear, selectedMonth, 1).toLocaleDateString("en-IN")} &rarr; {new Date(selectedYear, selectedMonth + 1, 0).toLocaleDateString("en-IN")}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="From Date"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="To Date"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: customFrom } }}
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                  />
                </Grid>
                {customFrom && customTo && (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Period Name Preview:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Payroll {new Date(customFrom).toLocaleDateString("en-IN")} - {new Date(customTo).toLocaleDateString("en-IN")}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary">
              Payroll will be calculated based on attendance records within the selected period.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCalcOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCalculate}
              disabled={isCalculating}
            >
              {isCalculating ? "Calculating..." : "Calculate Payroll"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // ── Employee view ──
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
