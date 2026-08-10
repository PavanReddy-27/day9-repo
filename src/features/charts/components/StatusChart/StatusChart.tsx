// src/features/charts/components/StatusChart/StatusChart.tsx

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import BadgeIcon from "@mui/icons-material/Badge";
import { useTheme } from "../../../../context";

import ChartContainer from "../ChartContainer";

import type { StatusChartData } from "../../../../types/chart";
import { chartConfig, getChartPalette } from "../../../../constants/chartConfig";

import "./StatusChart.css";

interface StatusChartProps {
  data: StatusChartData[];
  loading?: boolean;
  error?: string;
  empty?: boolean;
  onRetry?: () => void;
}

const StatusChart = ({
  data,
  loading = false,
  error,
  empty = false,
  onRetry,
}: StatusChartProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const paletteMode = isDarkMode ? "dark" : "light";
  const config = chartConfig.statusDistribution;
  const colors = getChartPalette("statusDistribution", paletteMode);

  return (
    <ChartContainer
      title={config.title}
      subtitle={config.subtitle}
      action={<BadgeIcon color="primary" />}
      height={config.height}
      loading={loading}
      error={error}
      empty={empty || data.length === 0}
      emptyMessage={config.emptyMessage}
      onRetry={onRetry}
      retryLabel={config.retryLabel}
    >
      <ResponsiveContainer width="100%" height="100%" role="img" aria-label={config.title}>
        <PieChart style={{ backgroundColor: "var(--surface-solid)" }}>
          <Pie
            data={data}
            dataKey="employees"
            nameKey="status"
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={110}
            paddingAngle={3}
            label={({ name, percent }) =>
              `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
            labelLine={false}
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
          </Pie>

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

          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{
              paddingTop: 16,
              color: "var(--text)",
            }}
            formatter={(value) => <span style={{ color: "var(--text)" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default StatusChart;