// src/features/charts/components/RoleChart/RoleChart.tsx

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

import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import ChartContainer from "../ChartContainer";

import type { RoleChartData } from "../../../../types/chart";

import "./RoleChart.css";

interface RoleChartProps {
  data: RoleChartData[];
  loading?: boolean;
}

const COLORS = [
  "#2563EB",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
  "#84CC16",
];

const RoleChart = ({
  data,
  loading = false,
}: RoleChartProps) => {
  if (loading) {
    return (
      <ChartContainer
        title="Role Distribution"
        subtitle="Loading..."
      >
        <div className="role-chart__state">
          Loading...
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title="Role Distribution"
      subtitle="Employees grouped by job role"
      action={<WorkOutlineOutlinedIcon color="primary" />}
      height={420}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
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
            horizontal
            vertical={false}
          />

          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            type="category"
            dataKey="role"
            width={170}
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
            radius={[0, 8, 8, 0]}
            barSize={18}
          >
            {data.map((item, index) => (
              <Cell
                key={item.role}
                fill={
                  COLORS[index % COLORS.length]
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