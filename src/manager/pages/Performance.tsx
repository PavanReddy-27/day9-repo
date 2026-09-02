import { useMemo, useState, useEffect } from "react";
import { Box, Paper, Typography, TextField, Button } from "@mui/material";
import { Download } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import KPICards from "../../features/kpi/components/KPICards";
import type { KPIItem } from "../../features/kpi/components/KPICards/KPICards";
import StatusChart from "../../features/charts/components/StatusChart";
import type { StatusChartData } from "../../types/chart";
import PageState from "../../components/PageState";

import type { TeamMember } from "../data/teamData";
import { apiClient } from "../../services/apiClient";

import "./Performance.css";

const Performance = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchPerformance = async () => {
      try {
        const data = await apiClient("/employees").catch(() => []);
        if (!isMounted) return;

        const mapped: TeamMember[] = (Array.isArray(data) ? data : []).map((emp: any, idx: number) => ({
          id: emp.employeeId || emp._id,
          employeeId: emp.employeeId || emp._id,
          name: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Team Member',
          designation: emp.designation || 'Staff',
          department: emp.departmentName || emp.department || 'Engineering',
          location: emp.locationCode || emp.location || 'HQ',
          attendance: (["Present", "Late", "Absent", "On Leave"] as const)[idx % 4],
          risk: emp.riskLevel || (["Low", "Medium", "High"] as const)[idx % 3],
          performance: (["Excellent", "Good", "Average", "Needs Improvement"] as const)[idx % 4],
          productivity: 75 + (idx * 6) % 25,
          avatar: emp.avatar || '',
          email: emp.email,
          phone: emp.phone || '',
        }));

        setTeamMembers(mapped);
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load manager performance metrics");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPerformance();
    return () => {
      isMounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    return teamMembers.filter((r) => {
      return (
        ((r.name?.toLowerCase() || "").includes(search.toLowerCase())) ||
        ((r.employeeId?.toLowerCase() || "").includes(search.toLowerCase()))
      );
    });
  }, [teamMembers, search]);

  const averageProductivity = Math.round(
    rows.reduce((sum, item) => sum + (item.productivity || 0), 0) / (rows.length || 1)
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

  const handleExportCSV = () => {
    const csvContent = [
      ["Employee ID", "Name", "Role", "Status", "Performance", "Productivity %", "Risk"],
      ...rows.map((r) => [r.employeeId, r.name, r.designation, r.attendance, r.performance, `${r.productivity}%`, r.risk]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `manager_performance_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box className="performance-page">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" className="performance-title">
          Team Performance
        </Typography>
        <Button variant="outlined" startIcon={<Download />} onClick={handleExportCSV} sx={{ borderRadius: 2 }}>
          Export CSV
        </Button>
      </Box>

      {loading ? (
        <PageState type="loading" message="Loading team performance metrics..." />
      ) : error ? (
        <PageState type="error" message={error} onRetry={() => window.location.reload()} />
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

          {rows.length === 0 ? (
            <PageState type="empty" message="No performance records match your search." />
          ) : (
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
          )}

          <Box sx={{ mt: 4, height: 400 }}>
            <StatusChart data={chartData} />
          </Box>
        </>
      )}
    </Box>
  );
};

export default Performance;