import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import ChartContainer from "./ChartContainer";
import { useTheme } from "@mui/material";

interface DataPoint {
  [key: string]: any;
}

interface BarSeries {
  dataKey: string;
  name?: string;
  color?: string;
}

interface BarChartProps {
  title: string;
  subtitle?: string;
  data: DataPoint[];
  xAxisKey: string;
  series: BarSeries[];
  loading?: boolean;
  error?: string;
  height?: number | string;
  emptyMessage?: string;
  badgeText?: string;
  onRefresh?: () => void;
  stacked?: boolean;
  layout?: "horizontal" | "vertical";
  testId?: string;
}

const DEFAULT_COLORS = ["var(--primary)", "var(--secondary)", "var(--secondary)", "var(--success)", "var(--warning)", "var(--info)"];

export default function BarChart({
  title,
  subtitle,
  data,
  xAxisKey,
  series,
  loading,
  error,
  height = 360,
  emptyMessage = "No data available.",
  badgeText,
  onRefresh,
  stacked = false,
  layout = "horizontal",
  testId,
}: BarChartProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const textColor = isDark ? "var(--text-h)" : "var(--text-light)";
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.05)";
  const tooltipBg = isDark ? "rgba(17,24,39,0.8)" : "rgba(255,255,255,0.9)";

  const empty = !data || data.length === 0;

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      loading={loading}
      error={error}
      empty={empty}
      emptyMessage={emptyMessage}
      height={height}
      badgeText={badgeText}
      onRefresh={onRefresh}
      testId={testId}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={layout === "horizontal"} horizontal={layout === "vertical"} />
          
          {layout === "horizontal" ? (
            <>
              <XAxis
                dataKey={xAxisKey}
                stroke={gridColor}
                tick={{ fill: textColor, fontSize: 13, fontFamily: 'Inter' }}
                axisLine={{ stroke: gridColor }}
                tickLine={false}
                dy={10}
              />
              <YAxis
                stroke={gridColor}
                tick={{ fill: textColor, fontSize: 13, fontFamily: 'Inter' }}
                axisLine={{ stroke: gridColor }}
                tickLine={false}
                dx={-10}
              />
            </>
          ) : (
            <>
              <XAxis
                type="number"
                stroke={gridColor}
                tick={{ fill: textColor, fontSize: 13, fontFamily: 'Inter' }}
                axisLine={{ stroke: gridColor }}
                tickLine={false}
              />
              <YAxis
                dataKey={xAxisKey}
                type="category"
                stroke={gridColor}
                tick={{ fill: textColor, fontSize: 13, fontFamily: 'Inter' }}
                axisLine={{ stroke: gridColor }}
                tickLine={false}
                dx={-10}
              />
            </>
          )}

          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              color: textColor,
              borderRadius: "12px",
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              backdropFilter: "blur(12px)",
            }}
            cursor={{ fill: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }}
          />
          <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "14px", fontFamily: 'Inter' }} />
          {series.map((s, idx) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name || s.dataKey}
              fill={s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
              radius={stacked ? [0, 0, 0, 0] : [6, 6, 0, 0]}
              stackId={stacked ? "stack" : undefined}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
