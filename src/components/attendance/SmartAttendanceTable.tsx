import React, { useMemo } from 'react';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { AttendanceRecord, Location } from '../../types/attendance';

interface SmartAttendanceTableProps {
  records: AttendanceRecord[];
  role: 'HR' | 'Manager' | 'Team Lead' | 'Employee';
}

const statusColors: Record<string, { bg: string; color: string }> = {
  Present: { bg: "#16A34A22", color: "#16A34A" },
  Late: { bg: "#D9770622", color: "#D97706" },
  Absent: { bg: "#DC262622", color: "#DC2626" },
  Leave: { bg: "#9333EA22", color: "#9333EA" },
  "Half Day": { bg: "#2563EB22", color: "#2563EB" },
};

const formatTimeOnly = (isoStr: string | null | undefined) => {
  if (!isoStr) return "--:--";
  return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const openInMaps = (location: Location) => {
  window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, '_blank', 'noopener,noreferrer');
};

// Renders a time cell as a clickable location pin + timestamp (blue when a
// GPS reading is attached), matching the check-in/out pattern from payroll's
// attendance table. Clicking the pin opens the reading in Google Maps.
const LocationTimeCell = ({ time, location }: { time: string | null | undefined; location?: Location }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: '100%' }}>
    {location ? (
      <>
        <Tooltip title={`${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)} — View on map`}>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); openInMaps(location); }}
            sx={{ p: 0.25, color: '#2563EB' }}
          >
            <LocationOn fontSize="small" />
          </IconButton>
        </Tooltip>
        <Box component="span" sx={{ color: '#2563EB', fontWeight: 600 }}>{formatTimeOnly(time)}</Box>
      </>
    ) : (
      <Box component="span" sx={{ pl: '30px' }}>{formatTimeOnly(time)}</Box>
    )}
  </Box>
);

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
      {
        field: "checkInTime",
        headerName: "Check In",
        flex: 1.2,
        minWidth: 110,
        renderCell: (params) => <LocationTimeCell time={params.value} location={params.row.location} />
      },
      {
        field: "checkOutTime",
        headerName: "Check Out",
        flex: 1.2,
        minWidth: 110,
        renderCell: (params) => <LocationTimeCell time={params.value} location={params.row.checkOutLocation} />
      },
      { field: "workingHours", headerName: "Hours", flex: 0.8, minWidth: 50, valueFormatter: (value: unknown) => {
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
        getRowId={(row) => row.id || row._id || Math.random().toString()}
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
