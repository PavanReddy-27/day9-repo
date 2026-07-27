// src/features/charts/components/EmployeeTrendChart/EmployeeTrendChart.tsx

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import ChartContainer from "../ChartContainer";

import type { TrendChartData } from "../../../../types/chart";

import "./EmployeeTrendChart.css";

interface EmployeeTrendChartProps {
  data: TrendChartData[];
  loading?: boolean;
}

const EmployeeTrendChart = ({
  data,
  loading = false,
}: EmployeeTrendChartProps) => {
  if (loading) {
    return (
      <ChartContainer
        title="Workforce Trend"
        subtitle="Loading workforce analytics..."
      >
        <div className="employee-trend-chart__state">
          Loading...
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title="Workforce Trend"
      subtitle="Employee growth, hiring and attrition"
      action={<TrendingUpIcon color="primary" />}
      height={420}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient
              id="employeeGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="#1976d2"
                stopOpacity={0.35}
              />

              <stop
                offset="95%"
                stopColor="#1976d2"
                stopOpacity={0.02}
              />
            </linearGradient>

            <linearGradient
              id="hireGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="#2e7d32"
                stopOpacity={0.25}
              />

              <stop
                offset="95%"
                stopColor="#2e7d32"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
          />

          <Tooltip />

          <Legend />

          <Area
            type="monotone"
            dataKey="totalEmployees"
            name="Total Employees"
            fill="url(#employeeGradient)"
            stroke="#1976d2"
            strokeWidth={3}
          />

          <Line
            type="monotone"
            dataKey="activeEmployees"
            name="Active"
            stroke="#2e7d32"
            strokeWidth={3}
            dot={{
              r: 4,
            }}
            activeDot={{
              r: 7,
            }}
          />

          <Line
            type="monotone"
            dataKey="newHires"
            name="New Hires"
            stroke="#fb8c00"
            strokeWidth={3}
          />

          <Line
            type="monotone"
            dataKey="attrition"
            name="Attrition"
            stroke="#d32f2f"
            strokeWidth={3}
            strokeDasharray="6 6"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default EmployeeTrendChart;