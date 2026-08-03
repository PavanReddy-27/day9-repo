import { useMemo, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { teamData } from "../data/teamData";

import "./Performance.css";

const Performance = () => {
  const [search, setSearch] = useState("");

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
  }, [search]);

  const averageProductivity = Math.round(
    rows.reduce(
      (sum, item) => sum + item.productivity,
      0
    ) / (rows.length || 1)
  );

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
      minWidth: 180,
    },
    {
      field: "designation",
      headerName: "Role",
      width: 180,
    },
    {
      field: "performance",
      headerName: "Performance",
      width: 140,
    },
    {
      field: "productivity",
      headerName: "Productivity %",
      width: 150,
    },
    {
      field: "risk",
      headerName: "Risk",
      width: 120,
    },
  ];

  return (
    <Box className="performance-page">
      <Typography
        variant="h4"
        className="performance-title"
      >
        Team Performance
      </Typography>

      <Grid
        container
        spacing={3}
        className="performance-kpi-grid"
      >
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={3}
            className="performance-card"
          >
            <Typography color="text.secondary">
              Average Productivity
            </Typography>

            <Typography
              variant="h4"
              className="performance-value"
            >
              {averageProductivity}%
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={3}
            className="performance-card"
          >
            <Typography color="text.secondary">
              Top Rating
            </Typography>

            <Typography
              variant="h4"
              className="performance-value"
            >
              Excellent
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={3}
            className="performance-card"
          >
            <Typography color="text.secondary">
              Team Members
            </Typography>

            <Typography
              variant="h4"
              className="performance-value"
            >
              {rows.length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper
        elevation={3}
        className="performance-search-card"
      >
        <TextField
          fullWidth
          placeholder="Search employee..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </Paper>
      

<Paper
  elevation={3}
  className="performance-table-card"
>
  <DataGrid
    rows={rows}
    columns={columns}
    pageSizeOptions={[5, 10]}
    disableRowSelectionOnClick
    initialState={{
      pagination: {
        paginationModel: {
          page: 0,
          pageSize: 5,
        },
      },
    }}
  />
</Paper>

<Paper
  elevation={3}
  className="performance-chart-card"
>
  <Typography
    variant="h6"
    sx={{ fontWeight: 700 }}
    className="chart-title"
  >
    Productivity Overview
  </Typography>

  <div className="performance-chart">
    <ResponsiveContainer
      width="100%"
      height="100%"
    >
      <BarChart data={rows}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="avatar" />

        <YAxis />

        <Tooltip />

        <Bar
          dataKey="productivity"
          fill="#2563EB"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
</Paper>
</Box>
);
};

export default Performance;