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
    const referenceDate = new Date();
    
    // Find Monday of the current week (0 = Sunday, 1 = Monday)
    const dayOfWeek = referenceDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startOfWeek = new Date(referenceDate);
    startOfWeek.setDate(referenceDate.getDate() + diffToMonday);
    
    // Generate the 7 days (Monday to Sunday)
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      // Find record for this date
      const record = records.find(r => r.date === dateString);
      
      let hours = 0;
      let breakHours = 0;
      
      if (record) {
        hours = record.workingHours || 0;
        breakHours = (record.totalBreakDuration || 0) / 60;
        
        if (record.checkInTime && !record.checkOutTime) {
          const start = new Date(record.checkInTime).getTime();
          const end = new Date().getTime(); // Live current time
          hours = Math.max(0, (end - start) / (1000 * 60 * 60) - breakHours);
        } else if (record.checkInTime && record.checkOutTime && !record.workingHours) {
          const start = new Date(record.checkInTime).getTime();
          const end = new Date(record.checkOutTime).getTime();
          hours = Math.max(0, (end - start) / (1000 * 60 * 60) - breakHours);
        }
      }

      weekDays.push({
        date: d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
        hours: Number(hours.toFixed(1)),
        break: Number(breakHours.toFixed(1))
      });
    }
    
    return weekDays;
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
              domain={[0, (dataMax: number) => Math.max(8, Math.ceil(dataMax))]}
              tickFormatter={(value) => `${value}h`}
            />
            <Tooltip
              cursor={{ fill: 'var(--bg)' }}
              contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-h)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar 
              dataKey="hours" 
              name="Working Hours" 
              stackId="a" 
              fill="var(--primary)" 
              radius={[4, 4, 0, 0]} 
              background={{ fill: 'rgba(0,0,0,0.04)', radius: 4 }} 
            />
            <Bar 
              dataKey="break" 
              name="Break Hours" 
              stackId="a" 
              fill="#ed6c02" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default AttendanceChart;
