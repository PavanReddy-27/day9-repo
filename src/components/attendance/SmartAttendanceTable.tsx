import React, { useMemo } from 'react';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { AttendanceRecord } from '../../types/attendance';

interface SmartAttendanceTableProps {
  records: AttendanceRecord[];
  role: 'HR' | 'Manager' | 'Employee';
  defaultSort?: 'asc' | 'desc';
  hidePagination?: boolean;
}

const statusColors: Record<string, { bg: string; color: string }> = {
  Present: { bg: "#16A34A22", color: "#16A34A" },
  Late: { bg: "#D9770622", color: "#D97706" },
  Absent: { bg: "#DC262622", color: "#DC2626" },
  Leave: { bg: "#9333EA22", color: "#9333EA" },
  "Half Day": { bg: "#2563EB22", color: "#2563EB" },
  "Half Leave": { bg: "#2563EB22", color: "#2563EB" },
};

const formatTimeOnly = (isoStr: string | null | undefined) => {
  if (!isoStr) return "--:--";
  return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getLat = (loc?: any) => loc?.latitude ?? loc?.lat ?? null;
const getLng = (loc?: any) => loc?.longitude ?? loc?.lng ?? null;

const openInMaps = (location: any) => {
  const lat = getLat(location);
  const lng = getLng(location);
  if (lat != null && lng != null) {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank', 'noopener,noreferrer');
  }
};

// Renders a time cell as a clickable location pin + timestamp (blue when a
// GPS reading is attached). Clicking the pin opens the reading in Google Maps.
const LocationTimeCell = ({ time, location, label }: { time: string | null | undefined; location?: any; label?: string }) => {
  const lat = getLat(location);
  const lng = getLng(location);
  const hasGeo = lat != null && lng != null;
  const locationText = location?.name || (hasGeo ? `${lat.toFixed(2)}, ${lng.toFixed(2)}` : null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', py: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {hasGeo || locationText ? (
          <>
            <Tooltip title={`${label ? label + ': ' : ''}${locationText || 'Location'}${hasGeo ? ` (${lat.toFixed(4)}, ${lng.toFixed(4)})` : ''} — Click to view on map`}>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); openInMaps(location); }}
                sx={{ p: 0.25, color: '#2563EB' }}
              >
                <LocationOn fontSize="small" />
              </IconButton>
            </Tooltip>
            <Box component="span" sx={{ color: '#2563EB', fontWeight: 700 }}>{formatTimeOnly(time)}</Box>
          </>
        ) : (
          <Box component="span" sx={{ pl: '28px', color: 'var(--text-h)' }}>{formatTimeOnly(time)}</Box>
        )}
      </Box>
      {locationText && (
        <Box component="span" sx={{ fontSize: '0.72rem', color: 'var(--text-light)', pl: '28px', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>
          📍 {locationText}
        </Box>
      )}
    </Box>
  );
};

export const SmartAttendanceTable: React.FC<SmartAttendanceTableProps> = ({ records, role, defaultSort = 'desc', hidePagination = false }) => {
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
        renderCell: (params) => <LocationTimeCell time={params.value} location={params.row.location} label="Check In Location" />
      },
      {
        field: "checkOutTime",
        headerName: "Check Out",
        flex: 1.2,
        minWidth: 110,
        renderCell: (params) => <LocationTimeCell time={params.value} location={params.row.checkOutLocation} label="Check Out Location" />
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
      flexGrow: 1,
      width: '100%', 
      minHeight: 420, 
      bgcolor: 'var(--surface)', 
      borderRadius: 3,
      border: '1px solid var(--border)',
      overflow: 'hidden',
      '& .MuiDataGrid-root': {
        border: 'none',
        color: 'var(--text-h)',
        background: 'transparent !important',
      },
      '& .MuiDataGrid-cell': {
        borderBottom: '1px solid var(--border)',
      },
      '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeadersInner, & .MuiDataGrid-topContainer, & .MuiDataGrid-filler, & .MuiDataGrid-columnHeader': {
        borderBottom: '1px solid var(--border)',
        color: 'var(--text-h) !important',
        fontWeight: 600,
        background: 'var(--surface-solid) !important',
      },
      '& .MuiDataGrid-footerContainer': {
        borderTop: '1px solid var(--border)',
        backgroundColor: 'transparent !important',
      },
      '& .MuiDataGrid-row': {
        backgroundColor: 'transparent !important',
      },
      '& .MuiDataGrid-row:hover, & .MuiDataGrid-row.Mui-hovered': {
        backgroundColor: 'rgba(128, 128, 128, 0.1) !important',
      }

    }}>
      <DataGrid
        sx={{ flex: 1 }}
        rows={records}
        getRowId={(row) => row.id || row._id || Math.random().toString()}
        columns={columns}
        pageSizeOptions={[5, 7, 10, 14, 20, 50]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: hidePagination ? 7 : 10 },
          },
          sorting: {
            sortModel: [{ field: 'date', sort: defaultSort }],
          },
        }}
        hideFooter={hidePagination}
        disableRowSelectionOnClick
      />
    </Box>
  );
};
