// src/features/charts/components/DepartmentChart/DepartmentChart.tsx

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import GroupsIcon from "@mui/icons-material/Groups";
import { useTheme } from "@mui/material/styles";

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
}

const DepartmentChart = ({
  data,
  loading = false,
  error,
  empty = false,
  onRetry,
}: DepartmentChartProps) => {
  const theme = useTheme();
  const paletteMode = theme.palette.mode === "dark" ? "dark" : "light";
  const config = chartConfig.departmentDistribution;
  const colors = getChartPalette("departmentDistribution", paletteMode);

  return (
    <ChartContainer
      title={config.title}
      subtitle={config.subtitle}
      action={<GroupsIcon color="primary" />}
      height={config.height}
      loading={loading}
      error={error}
      empty={empty || data.length === 0}
      emptyMessage={config.emptyMessage}
      onRetry={onRetry}
      retryLabel={config.retryLabel}
    >
      <ResponsiveContainer width="100%" height="100%" role="img" aria-label={config.title}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
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
            {data.map((department, index) => (
              <Cell
                key={department.id}
                fill={
                  colors[index % colors.length]
                }
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) => [
              value,
              "Employees",
            ]}
          />

          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{
              paddingTop: 16,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default DepartmentChart;