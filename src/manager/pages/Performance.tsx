import { useEffect, useMemo, useState } from "react";
import { Box, Paper, Typography, TextField, CircularProgress, Alert, Button } from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import KPICards from "../../features/kpi/components/KPICards";
import type { KPIItem } from "../../features/kpi/components/KPICards/KPICards";
import StatusChart from "../../features/charts/components/StatusChart";
import type { StatusChartData } from "../../types/chart";
import { apiClient } from "../../services/apiClient";

import "./Performance.css";

interface TeamPerformanceRow {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  attendance: string;
  performance: string;
  performanceScore: number;
  productivity: number;
  risk: string;
}

const Performance = () => {
  const [employees, setEmployees] = useState<TeamPerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Backend automatically applies role-based data scoping for managers:
      // only employees in the manager's assigned department/team are returned,
      // and enrichWithScores() attaches real aggregated PerformanceRecord & ProductivityRecord scores.
      const data = await apiClient<any[]>("/employees?limit=200");
      const mapped: TeamPerformanceRow[] = (Array.isArray(data) ? data : []).map((emp: any) => {
        const perfScore = typeof emp.performanceScore === "number" ? emp.performanceScore : 0;
        const perfLabel =
          emp.performance ||
          (perfScore >= 85 ? "Excellent" : perfScore >= 70 ? "Good" : "Average");

        return {
          id: emp._id || emp.employeeId,
          employeeId: emp.employeeId,
          name: emp.fullName || emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
          designation: emp.designation || emp.role || "Team Member",
          attendance: emp.employmentStatus === "Active" ? "Present" : emp.employmentStatus || "Present",
          performance: perfLabel,
          performanceScore: perfScore,
          productivity: typeof emp.productivity === "number" ? emp.productivity : (perfScore || 80),
          risk: emp.riskLevel || "Low",
        };
      });
      setEmployees(mapped);
    } catch (err: any) {
      console.error("Failed to fetch team performance:", err);
      setError(err?.message || "Failed to load team performance from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const rows = useMemo(() => {
    return employees.filter((r) => {
      return (
        ((r.name?.toLowerCase() || "").includes(search.toLowerCase())) ||
        ((r.employeeId?.toLowerCase() || "").includes(search.toLowerCase()))
      );
    });
  }, [search, employees]);

  const averageProductivity = Math.round(
    rows.reduce(
      (sum, item) => sum + item.productivity,
      0
    ) / (rows.length || 1)
  );

  const topRating = useMemo(() => {
    if (!rows.length) return "N/A";
    const hasExcellent = rows.some((r) => r.performance === "Excellent");
    if (hasExcellent) return "Excellent";
    const hasGood = rows.some((r) => r.performance === "Good");
    return hasGood ? "Good" : "Average";
  }, [rows]);

  const kpiData: KPIItem[] = [
    { id: "performanceScore", title: "Average Productivity", value: `${averageProductivity}%`, trend: 0 },
    { id: "trainingCompletion", title: "Top Rating", value: topRating, trend: 0 },
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

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ py: 4 }}>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={fetchData}>
              Retry
            </Button>
          }>
            {error}
          </Alert>
        </Box>
      ) : (
        <>
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
              getRowId={(row) => row.employeeId || row.id || Math.random()}
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
        </>
      )}
    </Box>
  );
};

export default Performance;