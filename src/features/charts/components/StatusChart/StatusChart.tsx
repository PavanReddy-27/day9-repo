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

import ChartContainer from "../ChartContainer";

import type { StatusChartData } from "../../../../types/chart";

import "./StatusChart.css";

interface StatusChartProps {
  data: StatusChartData[];
  loading?: boolean;
}

const COLORS = {
  Active: "#2E7D32",
  "On Leave": "#F9A825",
  Inactive: "#D32F2F",
  "Notice Period": "#1976D2",
};

const StatusChart = ({
  data,
  loading = false,
}: StatusChartProps) => {
  if (loading) {
    return (
      <ChartContainer
        title="Employee Status"
        subtitle="Loading..."
      >
        <div className="status-chart__state">
          Loading...
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title="Employee Status"
      subtitle="Current workforce distribution"
      action={<BadgeIcon color="primary" />}
      height={420}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <PieChart>
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
                  COLORS[
                    item.status as keyof typeof COLORS
                  ] ?? "#1976D2"
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

export default StatusChart;