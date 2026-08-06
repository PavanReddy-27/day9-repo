import React, { useMemo } from 'react';
import { Box, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { AttendanceRecord } from '../../types/attendance';

interface SmartAttendanceTableProps {
  records: AttendanceRecord[];
  role: 'HR' | 'Manager' | 'Employee';
}

const statusColors: Record<string, { bg: string; color: string }> = {
  Present: { bg: "#16A34A22", color: "#16A34A" },
  Late: { bg: "#D9770622", color: "#D97706" },
  Absent: { bg: "#DC262622", color: "#DC2626" },
  Leave: { bg: "#9333EA22", color: "#9333EA" },
  "Half Day": { bg: "#2563EB22", color: "#2563EB" },
};

export const SmartAttendanceTable: React.FC<SmartAttendanceTableProps> = ({ records, role }) => {
  const columns = useMemo(() => {
    const cols: GridColDef[] = [];
    
    if (role !== 'Employee') {
      cols.push({ field: "employeeId", headerName: "ID", flex: 0.5, minWidth: 50 });
      cols.push({ field: "employeeName", headerName: "Employee", flex: 1.5, minWidth: 80 });
    }
    
    if (role === 'HR') {
      cols.push({ field: "department", headerName: "Dept", flex: 1, minWidth: 60 });
    }

    cols.push(
      { field: "date", headerName: "Date", flex: 1, minWidth: 70 },
      { field: "shiftType", headerName: "Shift", flex: 1, minWidth: 60 },
      { field: "checkInTime", headerName: "Check In", flex: 1, minWidth: 60, valueFormatter: (value: any) => {
        if (!value) return "--:--";
        return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }},
      { field: "checkOutTime", headerName: "Check Out", flex: 1, minWidth: 60, valueFormatter: (value: any) => {
        if (!value) return "--:--";
        return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }},
      { field: "workingHours", headerName: "Hours", flex: 0.8, minWidth: 50, valueFormatter: (value: any) => {
        return (value !== null && value !== undefined) ? `${value}h` : "--";
      }},
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        minWidth: 70,
        renderCell: (params) => {
          const color = statusColors[params.value] || { bg: "#eee", color: "#000" };
          return (
            <Chip 
              label={params.value} 
              size="small" 
              sx={{ bgcolor: color.bg, color: color.color, fontWeight: 600 }} 
            />
          );
        }
      },
      {
        field: "flags",
        headerName: "Flags",
        flex: 1.5,
        minWidth: 80,
        renderCell: (params) => {
          const { row } = params;
          return (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', pt: 1 }}>
              {row.lateArrival && <Chip label="Late" size="small" sx={{ bgcolor: "#FDE68A", color: "#D97706", fontWeight: 600 }} />}
              {row.isOvertime && <Chip label="Overtime" size="small" sx={{ bgcolor: "#DBEAFE", color: "#2563EB", fontWeight: 600 }} />}
              {row.source === "Offline" && <Chip label="Offline Sync" size="small" sx={{ bgcolor: "#E5E7EB", color: "#4B5563", fontWeight: 600 }} />}
            </Box>
          );
        }
      }
    );

    return cols;
  }, [role]);

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      width: '100%', 
      minHeight: 420, 
      bgcolor: 'var(--surface)', 
      borderRadius: 3,
      border: '1px solid var(--border)',
      overflow: 'hidden',
      '& .MuiDataGrid-root': {
        border: 'none',
        color: 'var(--text-h)',
      },
      '& .MuiDataGrid-cell': {
        borderBottom: '1px solid var(--border)',
      },
      '& .MuiDataGrid-columnHeaders': {
        bgcolor: 'rgba(0,0,0,0.02)',
        borderBottom: '1px solid var(--border)',
        color: 'var(--text-light)',
        fontWeight: 600,
      },
      '& .MuiDataGrid-footerContainer': {
        borderTop: '1px solid var(--border)',
      }
    }}>
      <DataGrid
        sx={{ flex: 1 }}
        rows={records}
        columns={columns}
        pageSizeOptions={[5, 10, 20, 50]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
          sorting: {
            sortModel: [{ field: 'date', sort: 'desc' }],
          },
        }}
        disableRowSelectionOnClick
      />
    </Box>
  );
};
