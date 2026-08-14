import { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Stack,
  Button,
  InputAdornment,
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";

import "./LeaveRequests.css";

interface LeaveRequest {
  id: number;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

const initialRequests: LeaveRequest[] = [
  {
    id: 1,
    employeeId: "EMP001",
    employeeName: "Rahul Sharma",
    department: "Engineering",
    leaveType: "Casual Leave",
    from: "2026-08-02",
    to: "2026-08-04",
    days: 3,
    reason: "Family Function",
    status: "Pending",
  },
  {
    id: 2,
    employeeId: "EMP002",
    employeeName: "Priya Patel",
    department: "Engineering",
    leaveType: "Sick Leave",
    from: "2026-08-01",
    to: "2026-08-02",
    days: 2,
    reason: "Viral Fever",
    status: "Approved",
  },
  {
    id: 3,
    employeeId: "EMP003",
    employeeName: "Anil Kumar",
    department: "Engineering",
    leaveType: "Earned Leave",
    from: "2026-08-10",
    to: "2026-08-15",
    days: 6,
    reason: "Vacation",
    status: "Pending",
  },
  {
    id: 4,
    employeeId: "EMP004",
    employeeName: "Sneha Reddy",
    department: "Engineering",
    leaveType: "Sick Leave",
    from: "2026-08-08",
    to: "2026-08-09",
    days: 2,
    reason: "Medical Rest",
    status: "Rejected",
  },
  {
    id: 5,
    employeeId: "EMP005",
    employeeName: "Vikram Singh",
    department: "Engineering",
    leaveType: "Casual Leave",
    from: "2026-08-12",
    to: "2026-08-13",
    days: 2,
    reason: "Personal Work",
    status: "Pending",
  },
];

const LeaveRequests = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [rows, setRows] =
    useState(initialRequests);

  const filteredRows = useMemo(() => {
    return rows.filter((item) => {
      const matchesSearch =
        (item.employeeName?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (item.employeeId?.toLowerCase() || "").includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All"
          ? true
          : item.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [rows, search, statusFilter]);

  const handleApprove = (id: number) => {
    setRows((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Approved",
            }
          : item
      )
    );
  };

  const handleReject = (id: number) => {
    setRows((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Rejected",
            }
          : item
      )
    );
  };

  const columns: GridColDef<LeaveRequest>[] = [
    {
      field: "employeeId",
      headerName: "Employee ID",
      width: 120,
    },
    {
      field: "employeeName",
      headerName: "Employee",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "department",
      headerName: "Department",
      width: 150,
    },
    {
      field: "leaveType",
      headerName: "Leave Type",
      width: 150,
    },
    {
      field: "from",
      headerName: "From",
      width: 120,
    },
    {
      field: "to",
      headerName: "To",
      width: 120,
    },
    {
      field: "days",
      headerName: "Days",
      width: 90,
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
      width: 140,
      renderCell: (params) => {
        const value = params.value as
          | "Pending"
          | "Approved"
          | "Rejected";

        const statusClass = value.toLowerCase();
        return (
          <span className={`status-badge ${statusClass}`}>
            {value}
          </span>
        );
      },
    },
    {
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
            disabled={
              params.row.status ===
              "Approved"
            }
            onClick={() =>
              handleApprove(params.row.id)
            }
          >
            Approve
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            disabled={
              params.row.status ===
              "Rejected"
            }
            onClick={() =>
              handleReject(params.row.id)
            }
          >
            Reject
          </Button>
        </Stack>
      ),
    },
  ];

  const pendingCount = rows.filter(
    (item) => item.status === "Pending"
  ).length;

  const approvedCount = rows.filter(
    (item) => item.status === "Approved"
  ).length;

  const rejectedCount = rows.filter(
    (item) => item.status === "Rejected"
  ).length;
  return (
    <Box className="leave-page">
      <Typography
        variant="h4"
        className="leave-title"
      >
        Leave Requests
      </Typography>

      <Paper
        elevation={3}
        className="leave-filter-card"
      >
        <Stack
          className="leave-filter-stack"
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={2}
        >
          <TextField
            fullWidth
            placeholder="Search by Employee Name or ID"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
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
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="leave-status-filter"
          >
            <MenuItem value="All">
              All Status
            </MenuItem>

            <MenuItem value="Pending">
              Pending
            </MenuItem>

            <MenuItem value="Approved">
              Approved
            </MenuItem>

            <MenuItem value="Rejected">
              Rejected
            </MenuItem>
          </TextField>
        </Stack>
      </Paper>

      <div className="leave-summary-grid">
        <Paper
          elevation={3}
          className="summary-card"
        >
          <Typography
            variant="h5"
            className="pending-count"
          >
            {pendingCount}
          </Typography>

          <Typography color="text.secondary">
            Pending
          </Typography>
        </Paper>

        <Paper
          elevation={3}
          className="summary-card"
        >
          <Typography
            variant="h5"
            className="approved-count"
          >
            {approvedCount}
          </Typography>

          <Typography color="text.secondary">
            Approved
          </Typography>
        </Paper>

        <Paper
          elevation={3}
          className="summary-card"
        >
          <Typography
            variant="h5"
            className="rejected-count"
          >
            {rejectedCount}
          </Typography>

          <Typography color="text.secondary">
            Rejected
          </Typography>
        </Paper>
      </div>

      <Paper
        elevation={3}
        className="leave-table-card"
      >
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          initialState={{
            pagination: {
              paginationModel: {
                page: 0,
                pageSize: 10,
              },
            },
          }}
          disableRowSelectionOnClick
        />
      </Paper>
    </Box>
  );
};

export default LeaveRequests;