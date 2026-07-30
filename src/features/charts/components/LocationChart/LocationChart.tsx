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
import { useTheme } from "@mui/material/styles";

import ChartContainer from "../ChartContainer";

import type { LocationChartData } from "../../../../types/chart";
import { chartConfig, getChartPalette } from "../../../../constants/chartConfig";

import "./LocationChart.css";

interface LocationChartProps {
  data: LocationChartData[];
  loading?: boolean;
  error?: string;
  empty?: boolean;
  onRetry?: () => void;
}

const LocationChart = ({
  data,
  loading = false,
  error,
  empty = false,
  onRetry,
}: LocationChartProps) => {
  const theme = useTheme();
  const paletteMode = theme.palette.mode === "dark" ? "dark" : "light";
  const config = chartConfig.locationDistribution;
  const colors = getChartPalette("locationDistribution", paletteMode);

  return (
    <ChartContainer
      title={config.title}
      subtitle={config.subtitle}
      action={<LocationOnIcon color="primary" />}
      height={config.height}
      loading={loading}
      error={error}
      empty={empty || data.length === 0}
      emptyMessage={config.emptyMessage}
      onRetry={onRetry}
      retryLabel={config.retryLabel}
    >
      <ResponsiveContainer width="100%" height="100%" role="img" aria-label={config.title}>
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

export default LocationChart;