import { useMemo, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Box, Paper, Typography, TextField } from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import KPICards from "../../features/kpi/components/KPICards";
import type { KPIItem } from "../../features/kpi/components/KPICards/KPICards";
import StatusChart from "../../features/charts/components/StatusChart";
import type { StatusChartData } from "../../types/chart";

import { useAppSelector } from "../../redux/hooks";
import { fetchEmployees, selectRestrictedDashboardEmployees } from "../../redux/dashboardSlice";
import type { AppDispatch } from "../../redux/store";
import type { TeamMember } from "../data/teamData";

import "./Performance.css";

const Performance = () => {
  const dispatch = useDispatch<AppDispatch>();
  const rawEmployees = useAppSelector(selectRestrictedDashboardEmployees);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const [search, setSearch] = useState("");

  const teamData: TeamMember[] = useMemo(() => {
    return rawEmployees.map((emp, i) => {
      const e = emp as Record<string, any>;
      const name = e.fullName || e.name || "Unknown";
      const deptName =
        e.departmentName ||
        (e.departmentId && typeof e.departmentId === "object" ? e.departmentId.name : undefined) ||
        (typeof e.department === "object" ? e.department?.name : e.department) ||
        "Unknown";
      return {
        id: i + 1,
        employeeId: e.employeeId,
        name,
        designation: e.designation || e.role,
        department: deptName,
        email: e.email,
        phone: e.phone || "—",
        attendance: e.attendance || "Present",
        // Real backend-derived scores (avg KPI / productivity per employee).
        performance: e.performance || "Average",
        risk: e.riskLevel || e.risk || "Low",
        experience: e.experience || 0,
        productivity: e.productivity ?? 0,
        avatar: name[0].toUpperCase(),
      };
    });
  }, [rawEmployees]);

  const rows = useMemo(() => {
    return teamData.filter(
      (item) =>
        item.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.employeeId
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [search, teamData]);

  const averageProductivity = Math.round(
    rows.reduce(
      (sum, item) => sum + item.productivity,
      0
    ) / (rows.length || 1)
  );

  const kpiData: KPIItem[] = [
    { id: "performanceScore", title: "Average Productivity", value: `${averageProductivity}%`, trend: 0 },
    { id: "trainingCompletion", title: "Top Rating", value: "Excellent", trend: 0 },
    { id: "activeEmployees", title: "Team Members", value: rows.length.toString(), trend: 0 },
  ];

  const chartData: StatusChartData[] = rows.map((r, i) => ({
    id: r.employeeId || i.toString(),
    status: r.name,
    employees: r.productivity,
    percentage: r.productivity,
  }));

  const columns: GridColDef[] = [
    { field: "employeeId", headerName: "Employee ID", width: 130 },
    { field: "name", headerName: "Employee", flex: 1, minWidth: 180 },
    { field: "designation", headerName: "Role", width: 180 },
    { field: "performance", headerName: "Performance", width: 140 },
    { field: "productivity", headerName: "Productivity %", width: 150 },
    { field: "risk", headerName: "Risk", width: 120 },
  ];

  return (
    <Box className="performance-page">
      <Typography variant="h4" className="performance-title">
        Team Performance
      </Typography>

      <Box sx={{ mb: 4, mt: 3 }}>
        <KPICards data={kpiData} />
      </Box>

      <Paper elevation={3} className="performance-search-card">
        <TextField
          fullWidth
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Paper>
      
      <Paper elevation={3} className="performance-table-card">
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10]}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
        />
      </Paper>

      <Box sx={{ mt: 4 }}>
        <StatusChart data={chartData} />
      </Box>
    </Box>
  );
};

export default Performance;