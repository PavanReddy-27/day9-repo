import { Box, Paper, Typography } from "@mui/material";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import "./LeaveOverviewChart.css";

const leaveData = [
  { month: "Jan", requested: 12, approved: 10, rejected: 2 },
  { month: "Feb", requested: 15, approved: 13, rejected: 2 },
  { month: "Mar", requested: 10, approved: 8, rejected: 2 },
  { month: "Apr", requested: 18, approved: 15, rejected: 3 },
  { month: "May", requested: 14, approved: 12, rejected: 2 },
  { month: "Jun", requested: 16, approved: 14, rejected: 2 },
  { month: "Jul", requested: 13, approved: 11, rejected: 2 },
];

const LeaveOverviewChart = () => {
  return (
    <Paper
      elevation={3}
      className="leave-chart-card"
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 700 }}
        className="leave-chart-title"
      >
        🌴 Leave Overview
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        className="leave-chart-subtitle"
      >
        Monthly leave requests, approvals and rejections.
      </Typography>

      <Box className="leave-chart-container">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart
            data={leaveData}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis domain={[0, 20]} />

            <Tooltip />

            <Legend />

            <Area
              type="monotone"
              dataKey="requested"
              name="Requested"
              stroke="#2563EB"
              fill="#93C5FD"
              fillOpacity={0.8}
            />

            <Area
              type="monotone"
              dataKey="approved"
              name="Approved"
              stroke="#16A34A"
              fill="#86EFAC"
              fillOpacity={0.8}
            />

            <Area
              type="monotone"
              dataKey="rejected"
              name="Rejected"
              stroke="#DC2626"
              fill="#FCA5A5"
              fillOpacity={0.8}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default LeaveOverviewChart;