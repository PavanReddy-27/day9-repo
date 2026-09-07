// src/features/charts/components/DepartmentChart/DepartmentChart.tsx

import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import GroupsIcon from "@mui/icons-material/Groups";
import { useTheme } from "../../../../context";

import ChartContainer from "../ChartContainer";

import type { DepartmentChartData } from "../../../../types/chart";
import { chartConfig, getChartPalette } from "../../../../constants/chartConfig";

import "./DepartmentChart.css";

interface DepartmentChartProps {
  data: DepartmentChartData[];
  loading?: boolean;
  error?: string;
  empty?: boolean;
  onRetry?: () => void;
  title?: string;
  subtitle?: string;
}

const DepartmentChart = ({
  data,
  loading = false,
  error,
  empty = false,
  onRetry,
  title,
  subtitle,
}: DepartmentChartProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const paletteMode = isDarkMode ? "dark" : "light";
  const config = chartConfig.departmentDistribution;
  const colors = getChartPalette("departmentDistribution", paletteMode);

  // Group by base department name if per-location entries are passed (e.g. "Sales - BLR" -> "Sales")
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const hasLocationSuffix = data.some((d) => d.name && d.name.includes(" - "));
    if (!hasLocationSuffix || data.length <= 8) return data;

    const map = new Map<string, DepartmentChartData>();
    data.forEach((item, idx) => {
      const baseName = item.name.split(" - ")[0].trim();
      const existing = map.get(baseName);
      if (existing) {
        existing.value += item.value;
      } else {
        map.set(baseName, {
          ...item,
          id: `dept-${idx}`,
          name: baseName,
          value: item.value,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [data]);

  return (
    <ChartContainer
      title={title || config.title}
      subtitle={subtitle || config.subtitle}
      action={<GroupsIcon color="primary" />}
      height={config.height}
      loading={loading}
      error={error}
      empty={empty || chartData.length === 0}
      emptyMessage={config.emptyMessage}
      onRetry={onRetry}
      retryLabel={config.retryLabel}
    >
      <ResponsiveContainer width="100%" height={380} role="img" aria-label={title || config.title}>
        <PieChart style={{ backgroundColor: "var(--surface-solid)" }}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={115}
            paddingAngle={3}
            label={({ percent }) =>
              (percent ?? 0) >= 0.05 ? `${((percent ?? 0) * 100).toFixed(0)}%` : ""
            }
            labelLine={false}
          >
            {chartData.map((department, index) => {
              const color = colors[index % colors.length] ?? colors[0];
              return (
                <Cell
                  key={department.id || index}
                  fill={color}
                  stroke="var(--surface-solid)"
                  strokeWidth={2}
                />
              );
            })}
          </Pie>

          <Tooltip
            formatter={(value: any, name: any) => {
              const total = chartData.reduce((sum, d) => sum + d.value, 0);
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

export default DepartmentChart;