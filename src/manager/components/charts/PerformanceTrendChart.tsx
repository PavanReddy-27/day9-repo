import { Box, Paper, Typography } from "@mui/material";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import "./PerformanceTrendChart.css";

const performanceData = [
  { month: "Jan", score: 78 },
  { month: "Feb", score: 81 },
  { month: "Mar", score: 84 },
  { month: "Apr", score: 82 },
  { month: "May", score: 87 },
  { month: "Jun", score: 90 },
  { month: "Jul", score: 92 },
];

const PerformanceTrendChart = () => {
  return (
    <Paper
      elevation={3}
      className="performance-chart-card"
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 700 }}
        className="performance-chart-title"
      >
        📈 Team Performance Trend
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        className="performance-chart-subtitle"
      >
        Monthly team performance score analysis.
      </Typography>

      <Box className="performance-chart-container">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={performanceData}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis domain={[70, 100]} />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="score"
              name="Performance Score"
              stroke="var(--info)"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default PerformanceTrendChart;