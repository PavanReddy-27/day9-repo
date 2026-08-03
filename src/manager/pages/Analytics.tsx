import { Box, Paper, Typography } from "@mui/material";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

import "./Analytics.css";

const departmentData = [
  { name: "Engineering", value: 28 },
  { name: "QA", value: 8 },
  { name: "Design", value: 6 },
  { name: "Support", value: 4 },
];

const attendanceTrend = [
  { month: "Jan", attendance: 91 },
  { month: "Feb", attendance: 93 },
  { month: "Mar", attendance: 92 },
  { month: "Apr", attendance: 95 },
  { month: "May", attendance: 96 },
  { month: "Jun", attendance: 94 },
];

const riskData = [
  {
    name: "Low",
    value: 35,
    color: "#22C55E",
  },
  {
    name: "Medium",
    value: 9,
    color: "#F59E0B",
  },
  {
    name: "High",
    value: 4,
    color: "#EF4444",
  },
];

const kpis = [
  {
    title: "Team Members",
    value: "46",
  },
  {
    title: "Attendance",
    value: "94%",
  },
  {
    title: "Avg Productivity",
    value: "91%",
  },
  {
    title: "High Risk",
    value: "4",
  },
];

const Analytics = () => {
  return (
    <Box className="analytics-page">
      <Typography
        variant="h4"
        className="analytics-title"
      >
        📊 Manager Analytics
      </Typography>

      <div className="analytics-kpi-grid">
        {kpis.map((item) => (
          <Paper
            key={item.title}
            elevation={3}
            className="analytics-kpi-card"
          >
            <Typography className="analytics-kpi-label">
              {item.title}
            </Typography>

            <Typography
              variant="h4"
              className="analytics-kpi-value"
            >
              {item.value}
            </Typography>
          </Paper>
        ))}
      </div>

      <div className="analytics-chart-grid">
        <Paper
          elevation={3}
          className="analytics-chart-card"
        >
          <Typography
            variant="h6"
            className="chart-title"
          >
            Department Distribution
          </Typography>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />

                <Bar
                  dataKey="value"
                  fill="#2563EB"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Paper>

        <Paper
          elevation={3}
          className="analytics-chart-card"
        >
          <Typography
            variant="h6"
            className="chart-title"
          >
            Attendance Trend
          </Typography>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#2563EB"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Paper>

        <Paper
          elevation={3}
          className="analytics-chart-card analytics-risk-card"
        >
          <Typography
            variant="h6"
            className="chart-title"
          >
            Employee Risk Distribution
          </Typography>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {riskData.map((item) => (
                    <Cell
                      key={item.name}
                      fill={item.color}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Paper>
      </div>
    </Box>
  );
};

export default Analytics;