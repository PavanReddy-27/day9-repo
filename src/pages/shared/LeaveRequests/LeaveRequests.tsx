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
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import { useAppSelector } from "../../../hooks/redux";
import leaveApi, { LeaveRequestData } from "../../../services/leaveApi";
import "./LeaveRequests.css";

const SharedLeaveRequests = () => {
  const { user } = useAppSelector((state) => state.auth);
  const canApprove = user?.role === "Manager";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [rows, setRows] = useState<LeaveRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleApprove = async (id: string) => {
    try {
      await leaveApi.updateLeaveStatus(id, "Approved");
      await fetchLeaves();
    } catch (error) {
      console.error("Failed to approve leave", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await leaveApi.updateLeaveStatus(id, "Rejected");
      await fetchLeaves();
    } catch (error) {
      console.error("Failed to reject leave", error);
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter((item) => {
      const empName = item.employeeId ? `${item.employeeId.firstName || ''} ${item.employeeId.lastName || ''}`.toLowerCase() : '';
      const empIdStr = item.employeeId?.employeeId ? String(item.employeeId.employeeId).toLowerCase() : '';
      const matchesSearch =
        empName.includes(search.toLowerCase()) ||
        empIdStr.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ? true : item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  const columns: GridColDef<LeaveRequestData>[] = [
    {
      field: "empId",
      headerName: "Emp ID",
      width: 120,
      valueGetter: (_, row) => row.employeeId?.employeeId || "--",
    },
    {
      field: "employeeName",
      headerName: "Employee",
      flex: 1,
      minWidth: 160,
      valueGetter: (_, row) => row.employeeId ? `${row.employeeId.firstName} ${row.employeeId.lastName}` : "Employee",
    },
    {
      field: "type",
      headerName: "Leave Type",
      width: 140,
    },
    {
      field: "startDate",
      headerName: "From",
      width: 120,
    },
    {
      field: "endDate",
      headerName: "To",
      width: 120,
    },
    {
      field: "durationDays",
      headerName: "Days",
      width: 80,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "reason",
      headerName: "Reason",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        const value = (params.value || "Pending") as "Pending" | "Approved" | "Rejected";
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

  if (canApprove) {
    columns.push({
      field: "actions",
      headerName: "Actions",
      width: 220,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            disabled={params.row.status === "Approved"}
            onClick={() => handleApprove(params.row._id)}
          >
            Approve
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            disabled={params.row.status === "Rejected"}
            onClick={() => handleReject(params.row._id)}
          >
            Reject
          </Button>
        </Stack>
      ),
    });
  }

  // Calculate summaries based on role rules
  const pendingCount = rows.filter((item) => item.status === "Pending").length;
  const approvedCount = rows.filter((item) => item.status === "Approved").length;
  const rejectedCount = rows.filter((item) => item.status === "Rejected").length;

  return (
    <Box className="shared-leave-page">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" className="leave-title">
          {canApprove ? "Leave Approvals & Management" : "Leave Records"}
        </Typography>
      </Box>

      <div className="leave-summary-grid">
        {canApprove && (
          <Paper elevation={3} className="summary-card pending-card">
            <Typography variant="h5" className="summary-count">
              {pendingCount}
            </Typography>
            <Typography className="summary-label">Pending Approvals</Typography>
          </Paper>
        )}

        <Paper elevation={3} className="summary-card approved-card">
          <Typography variant="h5" className="summary-count">
            {approvedCount}
          </Typography>
          <Typography className="summary-label">Approved Leaves</Typography>
        </Paper>

        {canApprove && (
          <Paper elevation={3} className="summary-card rejected-card">
            <Typography variant="h5" className="summary-count">
              {rejectedCount}
            </Typography>
            <Typography className="summary-label">Rejected Leaves</Typography>
          </Paper>
        )}
      </div>

      <Paper elevation={3} className="leave-filter-card">
        <Stack
          className="leave-filter-stack"
          direction={{ xs: "column", md: "row" }}
          spacing={2}
        >
          <TextField
            fullWidth
            placeholder="Search by Employee Name or ID"
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

          <TextField
            select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="leave-status-filter"
          >
            <MenuItem value="All">All Status</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </TextField>
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
          className="shared-data-grid"
        />
      </Paper>
    </Box>
  );
};

export default SharedLeaveRequests;
