// src/features/charts/components/LocationChart/LocationChart.tsx

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

import LocationOnIcon from "@mui/icons-material/LocationOn";

import ChartContainer from "../ChartContainer";

import type { LocationChartData } from "../../../../types/chart";

import "./LocationChart.css";

interface LocationChartProps {
  data: LocationChartData[];
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
];

const LocationChart = ({
  data,
  loading = false,
}: LocationChartProps) => {
  if (loading) {
    return (
      <ChartContainer
        title="Location Distribution"
        subtitle="Loading..."
      >
        <div className="location-chart__state">
          Loading...
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title="Location Distribution"
      subtitle="Employees across office locations"
      action={<LocationOnIcon color="primary" />}
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
            dataKey="location"
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
            {data.map((item, index) => (
              <Cell
                key={item.id}
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

export default LocationChart;