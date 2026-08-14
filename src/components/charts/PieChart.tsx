import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import ChartContainer from "./ChartContainer";
import { useTheme } from "@mui/material";

interface PieDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

interface PieChartProps {
  title: string;
  subtitle?: string;
  data: PieDataPoint[];
  loading?: boolean;
  error?: string;
  height?: number | string;
  emptyMessage?: string;
  badgeText?: string;
  onRefresh?: () => void;
  colors?: string[];
  testId?: string;
}

const DEFAULT_COLORS = ["var(--primary)", "var(--secondary)", "var(--secondary)", "var(--success)", "var(--warning)", "var(--info)", "var(--success)"];

export default function PieChart({
  title,
  subtitle,
  data,
  loading,
  error,
  height = 360,
  emptyMessage = "No data available.",
  badgeText,
  onRefresh,
  colors = DEFAULT_COLORS,
  testId,
}: PieChartProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const textColor = isDark ? "var(--text-h)" : "var(--text-light)";
  const tooltipBg = isDark ? "rgba(17,24,39,0.8)" : "rgba(255,255,255,0.9)";
  const strokeColor = isDark ? "var(--bg)" : "var(--surface-solid)";

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
        <RechartsPieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="var(--primary)"
            label={({ cx, x, y, percent }) => (
              <text x={x} y={y} fill={isDark ? "var(--surface-solid)" : "var(--text-h)"} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'Inter' }}>
                {`${(percent || 0) * 100 > 0 ? ((percent || 0) * 100).toFixed(0) : 0}%`}
              </text>
            )}
            labelLine={{ stroke: textColor, strokeWidth: 1, strokeOpacity: 0.5 }}
          >
            {data?.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke={strokeColor} strokeWidth={3} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              color: textColor,
              borderRadius: "12px",
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              backdropFilter: "blur(12px)",
            }}
            itemStyle={{ color: isDark ? "var(--surface-solid)" : "var(--text-h)", fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "14px", fontFamily: 'Inter' }} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
