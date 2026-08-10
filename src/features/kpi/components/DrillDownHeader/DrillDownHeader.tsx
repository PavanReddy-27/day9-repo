import { memo } from "react";

import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Stack,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import "./DrillDownHeader.css";

export interface DrillDownHeaderProps {
  title: string;
  subtitle?: string;

  total?: number | string;

  lastUpdated?: string;

  comparisonEnabled?: boolean;

  onRefresh?: () => void;

  onExport?: () => void;

  onCompare?: () => void;

  onFullscreen?: () => void;

  onClose: () => void;
}

const DrillDownHeader = ({
  title,
  subtitle,
  total,
  lastUpdated,
  comparisonEnabled = false,
  onRefresh,
  onExport,
  onCompare,
  onFullscreen,
  onClose,
}: DrillDownHeaderProps) => {
  return (
    <header className="drilldown-header">
      <Box className="drilldown-header__left">
        <Box className="drilldown-header__content">
          <Typography
            variant="h5"
            className="drilldown-header__title"
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              variant="body2"
              className="drilldown-header__subtitle"
            >
              {subtitle}
            </Typography>
          )}

         <Stack
  direction="row"
  spacing={2}
  sx={{
    flexWrap: "wrap",
  }}
>
            {total !== undefined && (
              <Chip
                color="primary"
                label={`Total : ${total}`}
              />
            )}

            {comparisonEnabled && (
              <Chip
                color="secondary"
                label="Comparison Mode"
              />
            )}

            {lastUpdated && (
              <Chip
                icon={<AccessTimeIcon />}
                variant="outlined"
                label={lastUpdated}
              />
            )}
          </Stack>
        </Box>
      </Box>

      <Box className="drilldown-header__actions">
        {onRefresh && (
          <Tooltip title="Refresh">
            <IconButton
              size="small"
              onClick={onRefresh}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}

        {onExport && (
          <Tooltip title="Export CSV">
            <IconButton
              size="small"
              onClick={onExport}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        )}

        {onCompare && (
          <Tooltip title="Compare">
            <IconButton
              size="small"
              onClick={onCompare}
            >
              <CompareArrowsIcon />
            </IconButton>
          </Tooltip>
        )}

        {onFullscreen && (
          <Tooltip title="Fullscreen">
            <IconButton
              size="small"
              onClick={onFullscreen}
            >
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Close">
          <IconButton
            color="error"
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </header>
  );
};

export default memo(DrillDownHeader);