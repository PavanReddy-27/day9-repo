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

import ChartContainer from "../ChartContainer";

import type { DepartmentChartData } from "../../../../types/chart";

import "./DepartmentChart.css";

interface DepartmentChartProps {
  data: DepartmentChartData[];
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

const DepartmentChart = ({
  data,
  loading = false,
}: DepartmentChartProps) => {
  if (loading) {
    return (
      <ChartContainer
        title="Department Distribution"
        subtitle="Loading..."
      >
        <div className="department-chart__state">
          Loading...
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title="Department Distribution"
      subtitle="Employee distribution by department"
      action={<GroupsIcon color="primary" />}
      height={420}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
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
                  COLORS[index % COLORS.length]
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