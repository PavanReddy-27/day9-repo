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

import leaveApi, { LeaveRequestData } from "../../services/leaveApi";
import "./LeaveRequests.css";

const EmployeeLeaveRequests = () => {
  const [search, setSearch] = useState("");

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

      return matchesSearch;
    });
  }, [rows, search]);

  const columns: GridColDef<LeaveRequestData>[] = [
    {
      field: "type",
      headerName: "Leave Type",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "startDate",
      headerName: "From",
      width: 140,
    },
    {
      field: "endDate",
      headerName: "To",
      width: 140,
    },
    {
      field: "durationDays",
      headerName: "Days",
      width: 90,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "reason",
      headerName: "Reason",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => {
        const value = params.value as "Pending" | "Approved" | "Rejected";
        return (
          <Chip
            label={value}
            className={`status-chip ${value.toLowerCase()}`}
            size="small"
          />
        );
      },
    },
  ];

  return (
    <Box className="employee-leave-page">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" className="leave-title">
          My Leave Requests
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className="apply-leave-btn"
          onClick={() => setIsApplyModalOpen(true)}
        >
          Apply Leave
        </Button>
      </Box>

      <Paper elevation={3} className="leave-filter-card">
        <Stack
          className="leave-filter-stack"
          direction={{ xs: "column", md: "row" }}
          spacing={2}
        >
          <TextField
            fullWidth
            placeholder="Search by Leave Type or Reason"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>
      </Paper>

      <Paper elevation={3} className="leave-table-card">
        <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row._id}
          pageSizeOptions={[5, 10, 20]}
          loading={isLoading}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          disableRowSelectionOnClick
          className="employee-data-grid"
        />
      </Paper>

      {/* Apply Leave Modal */}
      <Dialog open={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Leave Type</InputLabel>
              <Select
                value={newLeave.type}
                label="Leave Type"
                onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })}
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
                label="From Date"
                type="date"
                value={newLeave.from}
                onChange={(e) => setNewLeave({ ...newLeave, from: e.target.value })}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
              <TextField
                fullWidth
                label="To Date"
                type="date"
                value={newLeave.to}
                onChange={(e) => setNewLeave({ ...newLeave, to: e.target.value })}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Stack>

            <TextField
              fullWidth
              label="Reason for Leave"
              multiline
              rows={3}
              value={newLeave.reason}
              onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsApplyModalOpen(false)} color="inherit" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleApplyLeave} 
            variant="contained" 
            className="apply-leave-btn"
            disabled={!newLeave.from || !newLeave.to || !newLeave.reason || isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Submit Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeLeaveRequests;
