import { useMemo, useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { AttendanceRecord } from '../../types/attendance';

interface AttendanceChartProps {
  records: AttendanceRecord[];
}

export const AttendanceChart = ({ records }: AttendanceChartProps) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // Force re-render every minute to update live ongoing hours
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const chartData = useMemo(() => {
    // Sort records by date ascending
    const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Filter out weekends (0 = Sunday, 6 = Saturday)
    const weekdaysOnly = sorted.filter(record => {
      const day = new Date(record.date).getDay();
      return day !== 0 && day !== 6;
    });
    
    // Take the last 7 weekdays
    const recent = weekdaysOnly.slice(-7);
    
    return recent.map(record => {
      // Calculate working hours if checkOutTime exists, else use static workingHours
      let hours = record.workingHours || 0;
      if (record.checkInTime && !record.checkOutTime) {
         const start = new Date(record.checkInTime).getTime();
         const end = new Date().getTime(); // Live current time
         hours = Math.max(0, (end - start) / (1000 * 60 * 60) - (record.totalBreakDuration || 0) / 60);
      } else if (record.checkInTime && record.checkOutTime && !hours) {
         const start = new Date(record.checkInTime).getTime();
         const end = new Date(record.checkOutTime).getTime();
         hours = Math.max(0, (end - start) / (1000 * 60 * 60) - (record.totalBreakDuration || 0) / 60);
      }
      
      return {
        date: new Date(record.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
        hours: Number(hours.toFixed(1)),
        break: Number(((record.totalBreakDuration || 0) / 60).toFixed(1))
      };
    });

  }, [records, tick]); // tick forces the chart to update live!

  if (chartData.length === 0) return null;

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid var(--border)', bgcolor: 'var(--surface)', mb: 4 }}>
      <Typography variant="h6" sx={{ color: "var(--text-h)", fontWeight: 600, mb: 3 }}>
        Weekly Hours Trend
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-light)', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-light)', fontSize: 12 }}
            />
            <Tooltip 
              cursor={{ fill: 'var(--bg)' }}
              contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-h)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="hours" name="Working Hours" stackId="a" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="break" name="Break Hours" stackId="a" fill="#ed6c02" radius={[0, 0, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default AttendanceChart;
