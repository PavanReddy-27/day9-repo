// src/features/kpi/components/DrillDownSummary/DrillDownSummary.tsx

import { Box, Typography, LinearProgress } from "@mui/material";
import { Grid } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";

import type { DrillDownStatistics } from "../../../../types/drilldown";

import "./DrillDownSummary.css";

export interface DrillDownSummaryProps {
  total: number | string;

  growth?: string;

  description?: string;

  statistics: DrillDownStatistics[];
}

const DrillDownSummary = ({
  total,
  growth,
  description,
  statistics,
}: DrillDownSummaryProps) => {
  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUpIcon fontSize="small" />;
    }

    if (trend < 0) {
      return <TrendingDownIcon fontSize="small" />;
    }

    return <TrendingFlatIcon fontSize="small" />;
  };

  const getTrendClass = (trend: number) => {
    if (trend > 0) {
      return "positive";
    }

    if (trend < 0) {
      return "negative";
    }

    return "neutral";
  };

  return (
    <Box className="drilldown-summary">
      <Box className="drilldown-summary__top">
        <Typography
          variant="h2"
          className="drilldown-summary__total"
        >
          {total}
        </Typography>

        {growth && (
          <Typography className="drilldown-summary__growth">
            {growth}
          </Typography>
        )}

        {description && (
          <Typography className="drilldown-summary__description">
            {description}
          </Typography>
        )}
      </Box>

      <Box className="drilldown-summary-grid">
        <Grid container spacing={2}>
          {statistics.map((item) => (
            <Grid
  key={item.id}
  size={{
    xs: 12,
    sm: 6,
    md: 4,
  }}
>
              <Box className="summary-card">
                <Typography className="summary-card__title">
                  {item.title}
                </Typography>

                <Typography className="summary-card__value">
                  {item.value}
                </Typography>

                <Box
                  className={`summary-card__trend ${getTrendClass(
                    item.trend
                  )}`}
                >
                  {getTrendIcon(item.trend)}

                  <Typography variant="caption">
                    {item.trend > 0 ? "+" : ""}
                    {item.trend}%
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={Math.min(
                    Math.abs(item.trend) * 10,
                    100
                  )}
                  className="summary-card__progress"
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default DrillDownSummary;