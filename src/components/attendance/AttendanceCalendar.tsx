import React, { useState, useMemo } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import type { AttendanceRecord } from '../../types/attendance';

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const statusColors: Record<string, { bg: string; color: string }> = {
  Present: { bg: "#16A34A22", color: "#16A34A" },
  Late: { bg: "#D9770622", color: "#D97706" },
  Absent: { bg: "#DC262622", color: "#DC2626" },
  Leave: { bg: "#9333EA22", color: "#9333EA" },
  "Half Day": { bg: "#2563EB22", color: "#2563EB" },
};

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ records, selectedDate, onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const calendarCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push(dateString);
    }
    return cells;
  }, [firstDayOfMonth, daysInMonth, year, month]);

  const recordsByDate = useMemo(() => {
    const map = new Map<string, AttendanceRecord[]>();
    records.forEach(r => {
      if (!map.has(r.date)) map.set(r.date, []);
      map.get(r.date)!.push(r);
    });
    return map;
  }, [records]);

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid var(--border)', bgcolor: 'var(--surface)', width: '100%', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" sx={{ color: "var(--text-h)", fontWeight: 600, pl: 1 }}>
          {monthNames[month]} {year}
        </Typography>
        <Box>
          <IconButton size="small" onClick={handlePrevMonth} sx={{ color: "var(--text-light)" }}>
            <ChevronLeft fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleNextMonth} sx={{ color: "var(--text-light)" }}>
            <ChevronRight fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
        {dayNames.map(day => (
          <Typography key={day} sx={{ textAlign: 'center', color: "var(--text-light)", fontWeight: 600, fontSize: '0.75rem', width: 36 }}>
            {day}
          </Typography>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
        {calendarCells.map((dateStr, index) => {
          if (!dateStr) return <Box key={`empty-${index}`} sx={{ width: 36, height: 36 }} />;
          
          const dayRecords = recordsByDate.get(dateStr) || [];
          const dayNum = parseInt(dateStr.split('-')[2], 10);
          
          const isSelected = selectedDate === dateStr;
          const hasRecords = dayRecords.length > 0;

          // Find the most prominent status to show a dot indicator
          let prominentStatus = "";
          if (hasRecords) {
            const hasAbsent = dayRecords.some(r => r.status === "Absent");
            const hasLate = dayRecords.some(r => r.status === "Late");
            prominentStatus = hasAbsent ? "Absent" : hasLate ? "Late" : "Present";
          }

          return (
            <Box 
              key={dateStr}
              onClick={() => onSelectDate(isSelected ? "" : dateStr)} // toggle off if clicked again
              sx={{ 
                width: 36, height: 36,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                bgcolor: isSelected ? "var(--primary)" : "transparent",
                color: isSelected ? "#fff" : "var(--text-h)",
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                '&:hover': { bgcolor: isSelected ? "var(--primary)" : "rgba(0,0,0,0.04)" }
              }}
            >
              <Typography sx={{ fontWeight: isSelected ? 700 : 500, fontSize: '0.85rem' }}>
                {dayNum}
              </Typography>
              
              {hasRecords && (
                <Box 
                  sx={{ 
                    position: 'absolute', bottom: 4,
                    width: 4, height: 4, borderRadius: '50%', 
                    bgcolor: isSelected ? "#fff" : (statusColors[prominentStatus]?.color || "#777")
                  }} 
                />
              )}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};
