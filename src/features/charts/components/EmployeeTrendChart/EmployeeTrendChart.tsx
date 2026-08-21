// src/features/charts/components/EmployeeTrendChart/EmployeeTrendChart.tsx

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useTheme } from "../../../../context";

import ChartContainer from "../ChartContainer";

import type { TrendChartData } from "../../../../types/chart";
import { chartConfig, getChartPalette } from "../../../../constants/chartConfig";

import "./EmployeeTrendChart.css";

interface EmployeeTrendChartProps {
  data: TrendChartData[];
  loading?: boolean;
  error?: string;
  empty?: boolean;
  onRetry?: () => void;
}

const EmployeeTrendChart = ({
  data,
  loading = false,
  error,
  empty = false,
  onRetry,
}: EmployeeTrendChartProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const paletteMode = isDarkMode ? "dark" : "light";
  const config = chartConfig.workforceTrend;
  const colors = getChartPalette("workforceTrend", paletteMode);

  return (
    <ChartContainer
      title={config.title}
      subtitle={config.subtitle}
      action={<TrendingUpIcon color="primary" />}
      height={config.height}
      loading={loading}
      error={error}
      empty={empty || data.length === 0}
      emptyMessage={config.emptyMessage}
      onRetry={onRetry}
      retryLabel={config.retryLabel}
    >
      <ResponsiveContainer width="100%" height={config.height} role="img" aria-label={config.title}>
        <ComposedChart
          style={{ backgroundColor: "var(--surface-solid)" }}
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
                stopColor={colors[0]}
                stopOpacity={0.35}
              />

              <stop
                offset="95%"
                stopColor={colors[0]}
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
                stopColor={colors[1]}
                stopOpacity={0.25}
              />

              <stop
                offset="95%"
                stopColor={colors[1]}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="4 4"
            stroke="var(--border)"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--text)" }}
            stroke="var(--border)"
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--text)" }}
            stroke="var(--border)"
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
            labelStyle={{ color: "var(--text)" }}
            itemStyle={{ color: "var(--text)" }}
          />

          <Legend
            wrapperStyle={{ color: "var(--text)" }}
            formatter={(value) => <span style={{ color: "var(--text)" }}>{value}</span>}
          />

          <Area
            type="monotone"
            dataKey="totalEmployees"
            name="Total Employees"
            fill="url(#employeeGradient)"
            stroke={colors[0]}
            strokeWidth={3}
          />

          <Line
            type="monotone"
            dataKey="activeEmployees"
            name="Active"
            stroke={colors[1]}
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
            stroke={colors[2]}
            strokeWidth={3}
          />

          <Line
            type="monotone"
            dataKey="attrition"
            name="Attrition"
            stroke={colors[3]}
            strokeWidth={3}
            strokeDasharray="6 6"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default EmployeeTrendChart;