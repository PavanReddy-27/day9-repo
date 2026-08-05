import { useState, useEffect, useMemo } from "react";
import { useAppSelector } from "../../hooks/redux";
import { Box, Paper, Typography, Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { teamData } from "../data/teamData";
import { attendanceApi } from "../../services/attendanceApi";
import type { AttendanceRecord } from "../../types/attendance";
import "./Attendance.css";

const baseRows = teamData.map((t) => ({
  ...t,
  date: "2026-07-31",
  checkIn: t.attendance === "Present" ? "09:12" : "--",
  checkOut: t.attendance === "Present" ? "18:05" : "--",
}));

const columns: GridColDef[] = [
  {
    field: "employeeId",
    headerName: "Employee ID",
    width: 130,
  },
  {
    field: "name",
    headerName: "Employee",
    flex: 1,
  },
  {
    field: "date",
    headerName: "Date",
    width: 140,
  },
  {
    field: "checkIn",
    headerName: "Check In",
    width: 130,
  },
  {
    field: "checkOut",
    headerName: "Check Out",
    width: 130,
  },
  {
    field: "attendance",
    headerName: "Status",
    width: 140,
    renderCell: (params) => (
      <Chip
        size="small"
        label={String(params.value)}
        color={
          params.value === "Present"
            ? "success"
            : params.value === "Leave"
              ? "warning"
              : "error"
        }
      />
    ),
  },
];

const Attendance = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [liveData, setLiveData] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const fetchRecords = async () => {
      if (user) {
        const records = await attendanceApi.getTeamRecords(user.username);
        setLiveData(records);
      }
    };
    fetchRecords();
  }, [user]);

  const rows = useMemo(() => {
    const liveRows = liveData.map(r => ({
      id: r.id,
      employeeId: r.employeeId,
      name: r.employeeName,
      role: "Team Member",
      performance: "Good",
      attendance: r.status,
      date: r.date,
      checkIn: r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--",
      checkOut: r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--",
    }));
    return [...liveRows, ...baseRows];
  }, [liveData]);

  const present = rows.filter(
    (r) => r.attendance === "Present"
  ).length;

  const leave = rows.filter(
    (r) => r.attendance === "Leave"
  ).length;

  const absent = rows.filter(
    (r) => r.attendance === "Absent"
  ).length;

  return (
    <Box className="attendance-page">
      <Typography
        variant="h4"
        className="attendance-title"
      >
        📅 Team Attendance
      </Typography>

      <div className="attendance-summary">
        <Paper elevation={3} className="attendance-card">
          <Typography className="attendance-label">
            Present
          </Typography>

          <Typography
            variant="h4"
            className="attendance-present"
          >
            {present}
          </Typography>
        </Paper>

        <Paper elevation={3} className="attendance-card">
          <Typography className="attendance-label">
            Leave
          </Typography>

          <Typography
            variant="h4"
            className="attendance-leave"
          >
            {leave}
          </Typography>
        </Paper>

        <Paper elevation={3} className="attendance-card">
          <Typography className="attendance-label">
            Absent
          </Typography>

          <Typography
            variant="h4"
            className="attendance-absent"
          >
            {absent}
          </Typography>
        </Paper>
      </div>

      <Paper elevation={3} className="attendance-table-paper">
        <div className="attendance-table">
          <DataGrid
            rows={rows}
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
        </div>
      </Paper>
    </Box>
  );
};

export default Attendance;