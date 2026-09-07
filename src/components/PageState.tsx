import React from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { ErrorOutlined, InboxOutlined } from "@mui/icons-material";

interface PageStateProps {
  type: "loading" | "error" | "empty";
  message?: string;
  onRetry?: () => void;
}

const PageState: React.FC<PageStateProps> = ({ type, message, onRetry }) => {
  if (type === "loading") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 6, gap: 2 }}>
        <CircularProgress size={36} sx={{ color: "var(--primary)" }} />
        <Typography sx={{ color: "var(--text-light)", fontSize: 14 }}>
          {message || "Loading workforce data..."}
        </Typography>
      </Box>
    );
  }

  if (type === "error") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 6, gap: 1.5, textAlign: "center" }}>
        <ErrorOutlined sx={{ fontSize: 44, color: "#DC2626" }} />
        <Typography variant="h6" sx={{ color: "var(--text-h)", fontWeight: 600 }}>
          Something went wrong
        </Typography>
        <Typography sx={{ color: "var(--text-light)", fontSize: 14, maxWidth: 400 }}>
          {message || "Unable to load data at this time."}
        </Typography>
        {onRetry && (
          <Button variant="outlined" color="error" size="small" onClick={onRetry} sx={{ mt: 1, borderRadius: 2 }}>
            Try Again
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 6, gap: 1.5, textAlign: "center" }}>
      <InboxOutlined sx={{ fontSize: 44, color: "var(--text-light)" }} />
      <Typography variant="h6" sx={{ color: "var(--text-h)", fontWeight: 600 }}>
        No data available
      </Typography>
      <Typography sx={{ color: "var(--text-light)", fontSize: 14 }}>
        {message || "There is no data to display matching your criteria."}
      </Typography>
    </Box>
  );
};

export default PageState;