import { memo } from "react";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
} from "@mui/material";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";

import "./DrillDownStatistics.css";

export interface StatisticItem {
  id: string;

  title: string;

  value: number | string;

  trend?: number;

  color?: string;

  progress?: number;

  suffix?: string;
}

interface DrillDownStatisticsProps {
  statistics: StatisticItem[];
}

const DrillDownStatistics = ({
  statistics,
}: DrillDownStatisticsProps) => {
  if (!statistics.length) {
    return null;
  }

  return (
    <section className="drilldown-statistics">
      {statistics.map((item) => {
        const TrendIcon =
          item.trend && item.trend > 0
            ? TrendingUpIcon
            : item.trend && item.trend < 0
            ? TrendingDownIcon
            : TrendingFlatIcon;

        const trendClass =
          item.trend && item.trend > 0
            ? "positive"
            : item.trend && item.trend < 0
            ? "negative"
            : "neutral";

        return (
          <Card
            key={item.id}
            elevation={0}
            className="drilldown-statistics__card"
          >
            <CardContent>
              <Box className="drilldown-statistics__top">
                <Typography
                  variant="body2"
                  className="drilldown-statistics__title"
                >
                  {item.title}
                </Typography>

                {item.trend !== undefined && (
                  <Chip
                    size="small"
                    icon={<TrendIcon />}
                    label={`${item.trend > 0 ? "+" : ""}${item.trend}%`}
                    className={`drilldown-statistics__trend ${trendClass}`}
                  />
                )}
              </Box>

              <Typography
                variant="h4"
                className="drilldown-statistics__value"
                sx={{
                  color: item.color,
                }}
              >
                {item.value}
                {item.suffix}
              </Typography>

              {item.progress !== undefined && (
                <Box
                  className="drilldown-statistics__progress"
                >
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(
                      Math.max(item.progress, 0),
                      100
                    )}
                    sx={{
                      height: 8,
                      borderRadius: 10,
                    }}
                  />

                  <Typography
                    variant="caption"
                    className="drilldown-statistics__percentage"
                  >
                    {item.progress.toFixed(0)}%
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
};

export default memo(DrillDownStatistics);