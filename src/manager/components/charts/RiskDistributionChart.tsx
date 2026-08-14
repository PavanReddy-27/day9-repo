import { Box, Paper, Typography, Stack } from "@mui/material";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import "./RiskDistributionChart.css";

const riskData = [
  {
    name: "Low Risk",
    value: 35,
    color: "var(--success)",
  },
  {
    name: "Medium Risk",
    value: 10,
    color: "var(--warning)",
  },
  {
    name: "High Risk",
    value: 3,
    color: "var(--error)",
  },
];

const RiskDistributionChart = () => {
  return (
    <Paper
      elevation={3}
      className="risk-chart-card"
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 700 }}
        className="risk-chart-title"
      >
        ⚠️ Employee Risk Distribution
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        className="risk-chart-subtitle"
      >
        Distribution of employees based on current risk level.
      </Typography>

      <Box className="risk-chart-container">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <PieChart>
            <Pie
              data={riskData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={45}
              paddingAngle={3}
              label
            >
              {riskData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                />
              ))}
            </Pie>

            <Tooltip />

            <Legend
              verticalAlign="bottom"
              height={36}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <Stack
        spacing={1}
        className="risk-chart-summary"
      >
        <Typography
          variant="body2"
          color="success.main"
          sx={{ fontWeight: 600 }}
        >
          ● Low Risk: 35 Employees
        </Typography>

        <Typography
          variant="body2"
          color="warning.main"
          sx={{ fontWeight: 600 }}
        >
          ● Medium Risk: 10 Employees
        </Typography>

        <Typography
          variant="body2"
          color="error.main"
          sx={{ fontWeight: 600 }}
        >
          ● High Risk: 3 Employees
        </Typography>
      </Stack>
    </Paper>
  );
};

export default RiskDistributionChart;