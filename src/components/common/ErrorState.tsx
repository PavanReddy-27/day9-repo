// ====================================
// File: src/components/common/ErrorState.tsx
// ====================================

import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Paper,
  Typography,
} from "@mui/material";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

const ErrorState = ({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  retryLabel = "Retry",
}: ErrorStateProps) => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 5,
        borderRadius: 3,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <ReportProblemIcon
          color="error"
          sx={{ fontSize: 72 }}
        />
      </Box>

      <Typography
        variant="h5"
        sx={{ fontWeight: 700, mb: 1 }}
      >
        {title}
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          maxWidth: 500,
          mx: "auto",
          mb: 4,
        }}
      >
        {message}
      </Typography>

      {onRetry && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      )}
    </Paper>
  );
};

export default ErrorState;