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
  title?: string;
  subtitle?: string;
}

const StatusChart = ({
  data,
  loading = false,
  error,
  empty = false,
  onRetry,
  title,
  subtitle,
}: StatusChartProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const paletteMode = isDarkMode ? "dark" : "light";
  const config = chartConfig.statusDistribution;
  const colors = getChartPalette("statusDistribution", paletteMode);

  return (
    <ChartContainer
      title={title || config.title}
      subtitle={subtitle || config.subtitle}
      action={<BadgeIcon color="primary" />}
      height={config.height}
      loading={loading}
      error={error}
      empty={empty || data.length === 0}
      emptyMessage={config.emptyMessage}
      onRetry={onRetry}
      retryLabel={config.retryLabel}
    >
      <ResponsiveContainer width="100%" height={380} role="img" aria-label={title || config.title}>
        <PieChart style={{ backgroundColor: "var(--surface-solid)" }}>
          <Pie
            data={data}
            dataKey="employees"
            nameKey="status"
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={105}
            paddingAngle={3}
            label={({ percent }) =>
              (percent ?? 0) >= 0.05 ? `${((percent ?? 0) * 100).toFixed(0)}%` : ""
            }
            labelLine={false}
          >
            {data.map((item, index) => {
              const color = colors[index % colors.length] ?? colors[0];
              return (
                <Cell
                  key={item.id || item.status || index}
                  fill={color}
                  stroke="var(--surface-solid)"
                  strokeWidth={2}
                />
              );
            })}
          </Pie>

          <Tooltip
            formatter={(value: any, name: any) => {
              const total = data.reduce((sum, d) => sum + d.employees, 0);
              const pct = total > 0 ? Math.round((Number(value) / total) * 100) : 0;
              return [`${value} employees (${pct}%)`, name];
            }}
            contentStyle={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
            labelStyle={{ color: "var(--text-h)", fontWeight: 600 }}
            itemStyle={{ color: "var(--text)" }}
          />

          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{
              paddingTop: 12,
              fontSize: "12px",
              color: "var(--text)",
            }}
            formatter={(value) => <span style={{ color: "var(--text)", fontWeight: 500 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default StatusChart;