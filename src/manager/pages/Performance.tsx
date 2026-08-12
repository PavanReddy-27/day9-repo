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
    return rawEmployees.map((emp, i) => ({
      id: i + 1,
      employeeId: emp.employeeId,
      name: emp.fullName || emp.name || 'Unknown',
      designation: emp.role,
      department: typeof emp.department === 'object' ? emp.department.name : emp.department,
      email: emp.email,
      phone: "+1 555-0100",
      attendance: "Present",
      performance: "Good",
      risk: (emp.risk as any) || "Low",
      experience: emp.experience || 0,
      productivity: 85,
      avatar: (emp.fullName || emp.name || 'A')[0].toUpperCase(),
    }));
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