// src/features/charts/components/RiskChart/RiskChart.tsx

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTheme } from "../../../../context";

import ChartContainer from "../ChartContainer";

import type { RiskChartData } from "../../../../types/chart";
import { chartConfig, getChartPalette } from "../../../../constants/chartConfig";

import "./RiskChart.css";

interface RiskChartProps {
  data: RiskChartData[];
  loading?: boolean;
  error?: string;
  empty?: boolean;
  onRetry?: () => void;
}

const RiskChart = ({
  data,
  loading = false,
  error,
  empty = false,
  onRetry,
}: RiskChartProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const paletteMode = isDarkMode ? "dark" : "light";
  const config = chartConfig.riskDistribution;
  const colors = getChartPalette("riskDistribution", paletteMode);

  return (
    <ChartContainer
      title={config.title}
      subtitle={config.subtitle}
      action={<WarningAmberIcon color="warning" />}
      height={config.height}
      loading={loading}
      error={error}
      empty={empty || data.length === 0}
      emptyMessage={config.emptyMessage}
      onRetry={onRetry}
      retryLabel={config.retryLabel}
    >
      <ResponsiveContainer width="100%" height="100%" role="img" aria-label={config.title}>
        <BarChart
          style={{ backgroundColor: "var(--surface-solid)" }}
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: 0,
            bottom: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="var(--border)"
            vertical={false}
          />

          <XAxis
            dataKey="risk"
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
            formatter={(value) => [
              value,
              "Employees",
            ]}
            contentStyle={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
            labelStyle={{ color: "var(--text)" }}
            itemStyle={{ color: "var(--text)" }}
          />

          <Legend wrapperStyle={{ color: "var(--text)" }} formatter={(value) => <span style={{ color: "var(--text)" }}>{value}</span>} />

          <Bar
            dataKey="employees"
            name="Employees"
            radius={[8, 8, 0, 0]}
          >
            {data.map((item) => {
              let color;
              if (item.risk === 'Low') color = paletteMode === 'dark' ? '#34d399' : 'var(--success)';
              else if (item.risk === 'Medium') color = paletteMode === 'dark' ? 'var(--warning)' : 'var(--warning)';
              else if (item.risk === 'High') color = paletteMode === 'dark' ? '#fb7185' : 'var(--error)';
              else if (item.risk === 'Critical') color = paletteMode === 'dark' ? '#f43f5e' : '#8b0000';
              else color = colors[data.findIndex((entry) => entry.id === item.id) % colors.length];

              return (
                <Cell
                  key={item.id}
                  fill={color}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default RiskChart;