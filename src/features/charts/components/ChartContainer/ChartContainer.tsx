// src/features/charts/components/ChartContainer/ChartContainer.tsx

import type { ReactNode } from "react";

import {
  Paper,
  Box,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Skeleton,
  Fade,
  Chip,
} from "@mui/material";

import {
  MoreVert,
  Fullscreen,
  Refresh,
  Download,
  TrendingUp,
} from "@mui/icons-material";

import "./ChartContainer.css";

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;

  height?: number | string;

  loading?: boolean;

  error?: string;

  action?: ReactNode;

  showHeader?: boolean;

  showDivider?: boolean;

  elevation?: number;

  badgeText?: string;

  lastUpdated?: string;

  onRefresh?: () => void;

  onExport?: () => void;

  onMoreClick?: () => void;

  onFullscreen?: () => void;
}

const ChartContainer = ({
  title,
  subtitle,
  children,

  height = 360,

  loading = false,

  error,

  action,

  showHeader = true,

  showDivider = true,

  elevation = 0,

  badgeText,

  lastUpdated,

  onRefresh,

  onExport,

  onMoreClick,

  onFullscreen,
}: ChartContainerProps) => {
  return (
    <Paper
      elevation={elevation}
      className="chart-container"
    >
      {showHeader && (
        <>
          <Box className="chart-container__header">
            <Box className="chart-container__title-section">
              <Box className="chart-container__title-row">
                <Typography
                  variant="h6"
                  className="chart-container__title"
                >
                  {title}
                </Typography>

                {badgeText && (
                  <Chip
                    icon={<TrendingUp />}
                    label={badgeText}
                    size="small"
                    color="success"
                    className="chart-container__badge"
                  />
                )}
              </Box>

              {(subtitle || lastUpdated) && (
                <Box className="chart-container__meta">
                  {subtitle && (
                    <Typography
                      variant="body2"
                      className="chart-container__subtitle"
                    >
                      {subtitle}
                    </Typography>
                  )}

                  {lastUpdated && (
                    <Typography
                      variant="caption"
                      className="chart-container__timestamp"
                    >
                      Updated {lastUpdated}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            <Box className="chart-container__actions">
              {action}

              {onRefresh && (
                <Tooltip title="Refresh">
                  <IconButton
                    size="small"
                    onClick={onRefresh}
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {onExport && (
                <Tooltip title="Export">
                  <IconButton
                    size="small"
                    onClick={onExport}
                  >
                    <Download fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {onFullscreen && (
                <Tooltip title="Fullscreen">
                  <IconButton
                    size="small"
                    onClick={onFullscreen}
                  >
                    <Fullscreen fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {onMoreClick && (
                <Tooltip title="More Options">
                  <IconButton
                    size="small"
                    onClick={onMoreClick}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          {showDivider && <Divider />}
        </>
      )}

      <Box
        className={`chart-container__content ${
          loading ? "chart-container__loading" : ""
        }`}
        sx={{ height }}
      >
        {loading ? (
          <Box className="chart-container__skeleton">
            <Skeleton
              variant="rounded"
              width="100%"
              height="100%"
            />
          </Box>
        ) : error ? (
          <Box className="chart-container__error">
            <Typography variant="body2">
              {error}
            </Typography>
          </Box>
        ) : (
          <Fade in timeout={400}>
            <Box
              sx={{
                width: "100%",
                height: "100%",
              }}
            >
              {children}
            </Box>
          </Fade>
        )}
      </Box>
    </Paper>
  );
};

export default ChartContainer;