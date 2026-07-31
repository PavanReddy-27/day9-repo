import { type ReactNode } from "react";

import {
  Box,
  Button,
  Chip,
  Divider,
  Fade,
  IconButton,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Download,
  Fullscreen,
  MoreVert,
  Refresh,
  TrendingUp,
} from "@mui/icons-material";

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  height?: number | string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyMessage?: string;
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
  onRetry?: () => void;
  retryLabel?: string;
  testId?: string;
}

const ChartContainer = ({
  title,
  subtitle,
  children,
  height = 360,
  loading = false,
  error,
  empty = false,
  emptyMessage = "No data available for this chart.",
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
  onRetry,
  retryLabel = "Retry",
  testId,
}: ChartContainerProps) => {
  const hasState = loading || Boolean(error) || empty;

  return (
    <Paper
      elevation={elevation}
      data-testid={testId}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.paper",
      }}
    >
      {showHeader && (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1.5,
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {title}
                </Typography>
                {badgeText && (
                  <Chip
                    icon={<TrendingUp />}
                    label={badgeText}
                    size="small"
                    color="success"
                  />
                )}
              </Box>
              {(subtitle || lastUpdated) && (
                <Box sx={{ mt: 0.25 }}>
                  {subtitle && (
                    <Typography variant="body2" color="text.secondary">
                      {subtitle}
                    </Typography>
                  )}
                  {lastUpdated && (
                    <Typography variant="caption" color="text.secondary">
                      Updated {lastUpdated}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {action}
              {onRefresh && (
                <Tooltip title="Refresh">
                  <IconButton size="small" onClick={onRefresh}>
                    <Refresh fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onExport && (
                <Tooltip title="Export">
                  <IconButton size="small" onClick={onExport}>
                    <Download fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onFullscreen && (
                <Tooltip title="Fullscreen">
                  <IconButton size="small" onClick={onFullscreen}>
                    <Fullscreen fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onMoreClick && (
                <Tooltip title="More Options">
                  <IconButton size="small" onClick={onMoreClick}>
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
        sx={{
          flex: 1,
          minHeight: typeof height === "number" ? `${height}px` : height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        {loading ? (
          <Box sx={{ width: "100%", height: "100%" }}>
            <Skeleton variant="rounded" width="100%" height="100%" />
          </Box>
        ) : hasState ? (
          <Box sx={{ textAlign: "center", maxWidth: 320 }}>
            {error ? (
              <Typography variant="body2" color="error" gutterBottom>
                {error}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {emptyMessage}
              </Typography>
            )}
            {onRetry && (
              <Button
                variant="outlined"
                size="small"
                onClick={onRetry}
                sx={{ mt: 1.5 }}
              >
                {retryLabel}
              </Button>
            )}
          </Box>
        ) : (
          <Fade in timeout={300}>
            <Box sx={{ width: "100%", height: "100%" }}>{children}</Box>
          </Fade>
        )}
      </Box>
    </Paper>
  );
};

export default ChartContainer;
