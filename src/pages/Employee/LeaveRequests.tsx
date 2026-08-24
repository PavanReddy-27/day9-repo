import { useMemo, useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Chip,
  Stack,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { EventAvailable } from "@mui/icons-material";

import leaveApi, { LeaveRequestData } from "../../services/leaveApi";


const EmployeeLeaveRequests = () => {
  const [search, setSearch] = useState("");
  // Default to showing all records unless a specific status is clicked
  const [statusFilter] = useState<string | null>(null);

  const [rows, setRows] = useState<LeaveRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [newLeave, setNewLeave] = useState({
    type: "Casual",
    from: "",
    to: "",
    reason: "",
  });

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const data = await leaveApi.getLeaves();
      setRows(data);
    } catch (error) {
      console.error("Failed to fetch leaves", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApplyLeave = async () => {
    if (!newLeave.from || !newLeave.to || !newLeave.reason) return;
    setIsSubmitting(true);
    
    try {
      await leaveApi.applyLeave({
        type: newLeave.type,
        startDate: newLeave.from,
        endDate: newLeave.to,
        reason: newLeave.reason,
      });
      setIsApplyModalOpen(false);
      setNewLeave({ type: "Casual", from: "", to: "", reason: "" });
      await fetchLeaves();
    } catch (error) {
      console.error("Failed to apply for leave", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter((item) => {
      const matchesSearch =
        item.type.toLowerCase().includes(search.toLowerCase()) ||
        item.reason.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = !statusFilter || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  const columns: GridColDef<LeaveRequestData>[] = [
    { field: "type", headerName: "Leave Type", flex: 1, minWidth: 150 },
    { field: "startDate", headerName: "From", width: 140 },
    { field: "endDate", headerName: "To", width: 140 },
    { field: "durationDays", headerName: "Days", width: 90, align: "center", headerAlign: "center" },
    { field: "reason", headerName: "Reason", flex: 1, minWidth: 200 },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => {
        const value = params.value as "Pending" | "Approved" | "Rejected";
        return (
          <Chip
            label={value}
            size="small"
            color={value === "Approved" ? "success" : value === "Rejected" ? "error" : "warning"}
          />
        );
      },
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "var(--text-h)", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
            <EventAvailable fontSize="large" sx={{ color: "var(--primary)" }} /> My Leave Requests
          </Typography>
          <Typography sx={{ color: "var(--text-light)", mt: 1 }}>
            Apply for leave, track your requests, and monitor your time off.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsApplyModalOpen(true)}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, px: 3, py: 1 }}
        >
          Apply Leave
        </Button>
      </Box>

      {/* Controls */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search by Leave Type or Reason..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, maxWidth: 400, bgcolor: "var(--surface)", '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "var(--text-light)" }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* Table */}
      <Paper elevation={0} sx={{ flexGrow: 1, border: "1px solid var(--border)", borderRadius: 2, bgcolor: "var(--surface)", overflow: "hidden" }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row._id}
          pageSizeOptions={[5, 10, 20]}
          loading={isLoading}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 10 } },
          }}
          disableRowSelectionOnClick
          sx={{
            border: 0,
            '& .MuiDataGrid-cell': { borderColor: "var(--border)", color: (theme) => theme.palette.mode === 'dark' ? '#fff' : 'var(--text-h)' },
            '& .MuiDataGrid-columnHeaders': { bgcolor: "var(--bg)", borderBottom: "1px solid var(--border)", color: "var(--text-light)" },
            '& .MuiDataGrid-footerContainer': { borderTop: "1px solid var(--border)", color: (theme) => theme.palette.mode === 'dark' ? '#fff' : 'var(--text-light)' },
            '& .MuiTablePagination-root': { color: (theme) => theme.palette.mode === 'dark' ? '#fff' : 'var(--text-h)' },
          }}
        />
      </Paper>

      {/* Apply Leave Modal */}
      <Dialog open={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Apply for Leave</DialogTitle>
        <DialogContent dividers sx={{ borderColor: "var(--border)" }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Leave Type</InputLabel>
              <Select
                value={newLeave.type}
                label="Leave Type"
                onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="Casual">Casual Leave</MenuItem>
                <MenuItem value="Sick">Sick Leave</MenuItem>
                <MenuItem value="Annual">Annual Leave</MenuItem>
                <MenuItem value="Unpaid">Unpaid Leave</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="From Date"
                type="date"
                value={newLeave.from}
                onChange={(e) => setNewLeave({ ...newLeave, from: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                size="small"
                label="To Date"
                type="date"
                value={newLeave.to}
                onChange={(e) => setNewLeave({ ...newLeave, to: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Stack>

            <TextField
              fullWidth
              label="Reason for Leave"
              multiline
              rows={3}
              value={newLeave.reason}
              onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsApplyModalOpen(false)} color="inherit" disabled={isSubmitting} sx={{ textTransform: "none", borderRadius: 2 }}>
            Cancel
          </Button>
          <Button 
            onClick={handleApplyLeave} 
            variant="contained" 
            color="primary"
            disabled={!newLeave.from || !newLeave.to || !newLeave.reason || isSubmitting}
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, px: 3 }}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Submit Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeLeaveRequests;
