// ====================================
// File: src/components/common/LoadingState.tsx
// ====================================

import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  variant?: "circular" | "linear";
  minHeight?: number | string;
}

const LoadingState = ({
  message = "Loading...",
  fullScreen = false,
  variant = "circular",
  minHeight = 300,
}: LoadingStateProps) => {
  const content = (
    <Box
      sx={{
        width: "100%",
        minHeight,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      {variant === "circular" ? (
        <CircularProgress />
      ) : (
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <LinearProgress />
        </Box>
      )}

      <Typography
        variant="body2"
        color="text.secondary"
      >
        {message}
      </Typography>
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

export default LoadingState;