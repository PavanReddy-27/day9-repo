// src/features/charts/components/RoleChart/RoleChart.tsx

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import { useTheme } from "../../../../context";
import ChartContainer from "../ChartContainer";

import type { RoleChartData } from "../../../../types/chart";
import { chartConfig, getChartPalette } from "../../../../constants/chartConfig";

import "./RoleChart.css";

interface RoleChartProps {
  data: RoleChartData[];
  loading?: boolean;
  error?: string;
  empty?: boolean;
  onRetry?: () => void;
}

const RoleChart = ({
  data,
  loading = false,
  error,
  empty = false,
  onRetry,
}: RoleChartProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const paletteMode = isDarkMode ? "dark" : "light";
  const config = chartConfig.roleDistribution;
  const colors = getChartPalette("roleDistribution", paletteMode);

  return (
    <ChartContainer
      title={config.title}
      subtitle={config.subtitle}
      action={<WorkOutlineOutlinedIcon color="primary" />}
      height={config.height}
      loading={loading}
      error={error}
      empty={empty || data.length === 0}
      emptyMessage={config.emptyMessage}
      onRetry={onRetry}
      retryLabel={config.retryLabel}
    >
      <ResponsiveContainer width="100%" height={340} role="img" aria-label={config.title}>
        <BarChart
          style={{ backgroundColor: "var(--surface-solid)" }}
          layout="vertical"
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="var(--border)"
            horizontal
            vertical={false}
          />

          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--text)" }}
            stroke="var(--border)"
          />

          <YAxis
            type="category"
            dataKey="role"
            width={170}
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



          <Bar
            dataKey="employees"
            name="Employees"
            radius={[0, 8, 8, 0]}
            barSize={18}
          >
            {data.map((item, index) => (
              <Cell
                key={item.role}
                fill={
                  colors[index % colors.length]
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default RoleChart;