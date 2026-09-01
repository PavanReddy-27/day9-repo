import type { ReactNode } from "react";

import {
  Card,
  Box,
  Typography,
} from "@mui/material";

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from "recharts";

import "./KPICard.css";

export interface KPICardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: string;
  trend?: number;
  subtitle?: string;
  sparklineData?: number[];
  onClick?: () => void;
}

const KPICard = ({
  title,
  value,
  icon,
  color,
  trend = 0,
  subtitle,
  sparklineData,
  onClick,
}: KPICardProps) => {
  const TrendIcon =
    trend > 0
      ? TrendingUpIcon
      : trend < 0
      ? TrendingDownIcon
      : TrendingFlatIcon;

  const trendClass =
    trend > 0
      ? "positive"
      : trend < 0
      ? "negative"
      : "neutral";

  const chartData = sparklineData
    ? sparklineData.map((val, index) => ({ value: val, name: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index] || "" }))
    : [];

  return (
    <Card className="kpi-card" elevation={0} onClick={onClick} sx={{ cursor: onClick ? 'pointer' : 'default' }}>
      <Box
        className="kpi-card__action"
      >
        <Box className="kpi-card__header">
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <Box
              className="kpi-card__icon"
              style={{
                color: color,
                backgroundColor: `${color}15`,
              }}
            >
              {icon}
            </Box>
            <Box>
              <Typography
                variant="body2"
                className="kpi-card__title"
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="caption"
                  className="kpi-card__subtitle"
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box className="kpi-card__more">
             <MoreHorizIcon />
          </Box>
        </Box>

        <Box className="kpi-card__body">
          <Typography
            variant="h3"
            className="kpi-card__value"
          >
            {value}
          </Typography>

          <Box className="kpi-card__trend-box">
             <Typography component="span" className={`kpi-card__trend-text ${trendClass}`}>
                <TrendIcon fontSize="small" />
                {Math.abs(trend)}%
             </Typography>
             <Typography component="span" className="kpi-card__trend-label">
                vs last month
             </Typography>
          </Box>
        </Box>

        {chartData.length > 0 && (
          <Box className="kpi-card__chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`colorUv-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--text-light)" }} hide />
                {typeof value === "string" && value.includes("%") && (
                   <YAxis domain={[0, 100]} hide />
                )}
                {typeof value === "string" && !value.includes("%") && (
                   <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                )}
                {typeof value === "number" && (
                   <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                )}
                <Area type="natural" dataKey="value" stroke={color} strokeWidth={3} fillOpacity={1} fill={`url(#colorUv-${title.replace(/\s+/g, '')})`} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default KPICard;