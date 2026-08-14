import { useMemo, useState } from "react";
import { Box, Paper, Typography, TextField } from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import KPICards from "../../features/kpi/components/KPICards";
import type { KPIItem } from "../../features/kpi/components/KPICards/KPICards";
import StatusChart from "../../features/charts/components/StatusChart";
import type { StatusChartData } from "../../types/chart";

import { teamData } from "../data/teamData";

import "./Performance.css";

const Performance = () => {
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    return teamData.filter((r) => {
      return (
        ((r.name?.toLowerCase() || "").includes(search.toLowerCase())) ||
        ((r.employeeId?.toLowerCase() || "").includes(search.toLowerCase()))
      );
    });
  }, [search]);

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

  const performanceCounts: Record<string, number> = {};
  
  rows.forEach((r) => {
    const status = r.performance || "Unknown";
    performanceCounts[status] = (performanceCounts[status] || 0) + 1;
  });

  const chartData: StatusChartData[] = Object.entries(performanceCounts).map(([status, count], i) => ({
    id: i.toString(),
    status,
    employees: count,
    percentage: Math.round((count / (rows.length || 1)) * 100),
  }));

  const columns: GridColDef[] = [
    { field: "employeeId", headerName: "Employee ID", width: 130 },
    { field: "name", headerName: "Employee", flex: 1, minWidth: 180 },
    { field: "designation", headerName: "Role", width: 180 },
    { 
      field: "attendance", 
      headerName: "Status", 
      width: 120,
      renderCell: (params) => (
        <span className={`status-badge ${String(params.value).toLowerCase()}`}>
          {params.value}
        </span>
      )
    },
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
          getRowId={(row) => row.employeeId || row._id || Math.random()}
          pageSizeOptions={[5, 10]}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
        />
      </Paper>

      <Box sx={{ mt: 4, height: 400 }}>
        <StatusChart data={chartData} />
      </Box>
    </Box>
  );
};

export default Performance;