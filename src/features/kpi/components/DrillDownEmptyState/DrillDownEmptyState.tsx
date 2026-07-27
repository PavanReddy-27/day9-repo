import { Box, Button, Typography } from "@mui/material";

import SearchOffIcon from "@mui/icons-material/SearchOff";
import RefreshIcon from "@mui/icons-material/Refresh";

import "./DrillDownEmptyState.css";

export interface DrillDownEmptyStateProps {
  title?: string;

  description?: string;

  actionLabel?: string;

  onAction?: () => void;
}

const DrillDownEmptyState = ({
  title = "No Data Found",
  description = "No matching records are available for the selected filters.",
  actionLabel = "Reset Filters",
  onAction,
}: DrillDownEmptyStateProps) => {
  return (
    <Box className="drilldown-empty">
      <SearchOffIcon className="drilldown-empty__icon" />

      <Typography
        variant="h5"
        className="drilldown-empty__title"
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        className="drilldown-empty__description"
      >
        {description}
      </Typography>

      {onAction && (
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default DrillDownEmptyState;