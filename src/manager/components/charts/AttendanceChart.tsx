import { Paper, Typography, Box } from "@mui/material";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import "./AttendanceChart.css";

const attendanceData = [
  { month: "Jan", present: 95, absent: 5 },
  { month: "Feb", present: 93, absent: 7 },
  { month: "Mar", present: 96, absent: 4 },
  { month: "Apr", present: 92, absent: 8 },
  { month: "May", present: 97, absent: 3 },
  { month: "Jun", present: 94, absent: 6 },
  { month: "Jul", present: 96, absent: 4 },
];

const AttendanceChart = () => {
  return (
    <Paper
      elevation={3}
      className="attendance-chart-card"
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 700 }}
        className="attendance-chart-title"
      >
        📅 Monthly Attendance
      </Typography>

      <Box className="attendance-chart-container">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis domain={[0, 100]} />

            <Tooltip />

            <Legend />

            <Bar
              dataKey="present"
              name="Present"
              fill="#16A34A"
              radius={[6, 6, 0, 0]}
            />

            <Bar
              dataKey="absent"
              name="Absent"
              fill="#DC2626"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default AttendanceChart;