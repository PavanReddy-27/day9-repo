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
      <ResponsiveContainer width="100%" height={320} role="img" aria-label={config.title}>
        <PieChart style={{ backgroundColor: "var(--surface-solid)" }}>
          <Pie
            data={data}
            dataKey="employees"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            label={({ name, percent }) =>
              `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {data.map((item) => {
              let color = colors[0]; // default fallback
              if (item.status === 'Active') color = paletteMode === 'dark' ? '#34d399' : 'var(--success)';
              else if (item.status === 'Inactive') color = paletteMode === 'dark' ? '#fb7185' : 'var(--error)';
              else if (item.status === 'Notice Period') color = paletteMode === 'dark' ? '#60a5fa' : 'var(--primary)';
              else if (item.status === 'On Leave') color = paletteMode === 'dark' ? '#fbbf24' : '#f9a825';
              else color = colors[data.findIndex((entry) => entry.id === item.id) % colors.length];

              return (
                <Cell
                  key={item.id}
                  fill={color}
                />
              );
            })}
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