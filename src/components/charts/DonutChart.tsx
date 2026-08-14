import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import ChartContainer from "./ChartContainer";
import { useTheme, Box, Typography } from "@mui/material";

interface PieDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

interface DonutChartProps {
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
  centerLabel?: string;
  centerValue?: string | number;
  testId?: string;
}

const DEFAULT_COLORS = ["var(--primary)", "var(--secondary)", "var(--secondary)", "var(--success)", "var(--warning)", "var(--info)", "var(--success)"];

export default function DonutChart({
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
  centerLabel,
  centerValue,
  testId,
}: DonutChartProps) {
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
      <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
        {(centerValue || centerLabel) && !empty && !loading && !error && (
          <Box
            sx={{
              position: "absolute",
              top: "45%", // adjusted for legend
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            {centerValue && (
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--text-h)", lineHeight: 1.2, fontFamily: 'Inter' }}>
                {centerValue}
              </Typography>
            )}
            {centerLabel && (
              <Typography variant="body2" sx={{ color: "var(--text-light)", fontFamily: 'Inter' }}>
                {centerLabel}
              </Typography>
            )}
          </Box>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              fill="var(--primary)"
              stroke="none"
              paddingAngle={2}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke={strokeColor} strokeWidth={2} />
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
      </Box>
    </ChartContainer>
  );
}
