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

import ChartContainer from "../ChartContainer";

import type { RiskChartData } from "../../../../types/chart";

import "./RiskChart.css";

interface RiskChartProps {
  data: RiskChartData[];
  loading?: boolean;
}

const COLORS = {
  Low: "#2E7D32",
  Medium: "#FB8C00",
  High: "#D32F2F",
  Critical: "#8B0000",
};

const RiskChart = ({
  data,
  loading = false,
}: RiskChartProps) => {
  if (loading) {
    return (
      <ChartContainer
        title="Risk Distribution"
        subtitle="Loading..."
      >
        <div className="risk-chart__state">
          Loading...
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title="Risk Distribution"
      subtitle="Employees grouped by risk level"
      action={<WarningAmberIcon color="warning" />}
      height={420}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
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
                  COLORS[
                    item.risk as keyof typeof COLORS
                  ] ?? "#1976D2"
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