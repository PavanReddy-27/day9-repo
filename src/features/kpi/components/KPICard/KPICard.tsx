// src/features/kpi/components/KPICard/KPICard.tsx

import type { ReactNode } from "react";

import {
  Card,
  CardActionArea,
  Box,
  Typography,
  Chip,
  LinearProgress,
} from "@mui/material";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import "./KPICard.css";

export interface KPICardProps {
  title: string;
  value: number | string;

  icon: ReactNode;

  color: string;

  trend?: number;

  subtitle?: string;

  progress?: number;

  footer?: string;

  onClick?: () => void;
}

const KPICard = ({
  title,
  value,
  icon,
  color,
  trend = 0,
  subtitle,
  progress,
  footer,
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

  return (
    <Card className="kpi-card" elevation={0}>
      <CardActionArea
        onClick={onClick}
        className="kpi-card__action"
      >
        <Box className="kpi-card__header">
          <Box
            className="kpi-card__icon"
            sx={{
              backgroundColor: color,
            }}
          >
            {icon}
          </Box>

          <Chip
            size="small"
            icon={<TrendIcon />}
            label={`${trend > 0 ? "+" : ""}${trend}%`}
            className={`kpi-card__trend ${trendClass}`}
          />
        </Box>

        <Box className="kpi-card__body">
          <Typography
            variant="body2"
            className="kpi-card__title"
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            className="kpi-card__value"
          >
            {value}
          </Typography>

          {subtitle && (
            <Typography
              variant="body2"
              className="kpi-card__subtitle"
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {progress !== undefined && (
          <Box className="kpi-card__progress">
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 20,
              }}
            />
          </Box>
        )}

        <Box className="kpi-card__footer">
          <Typography
            variant="caption"
            className="kpi-card__footer-text"
          >
            {footer ?? "Click for detailed analytics"}
          </Typography>

          <ArrowForwardIosIcon fontSize="inherit" />
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default KPICard;