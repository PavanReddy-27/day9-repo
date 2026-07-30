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
import { useTheme } from "@mui/material/styles";

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
  const theme = useTheme();
  const paletteMode = theme.palette.mode === "dark" ? "dark" : "light";
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
            vertical={false}
          />

          <XAxis
            dataKey="risk"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            formatter={(value) => [
              value,
              "Employees",
            ]}
          />

          <Legend />

          <Bar
            dataKey="employees"
            name="Employees"
            radius={[8, 8, 0, 0]}
          >
            {data.map((item) => (
              <Cell
                key={item.id}
                fill={
                  colors[
                    data.findIndex((entry) => entry.id === item.id) % colors.length
                  ] ?? colors[0]
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default RiskChart;