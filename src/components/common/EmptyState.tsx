// ====================================
// File: src/components/common/EmptyState.tsx
// ====================================

import type { ReactNode } from "react";

import {
  Box,
  Button,
  Paper,
  Typography,
} from "@mui/material";

import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({
  title,
  description = "No data available.",
  icon = (
    <InboxOutlinedIcon
      sx={{
        fontSize: 80,
        color: "text.disabled",
      }}
    />
  ),
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 6,
        borderRadius: 3,
        textAlign: "center",
      }}
    >
      <Box sx={{ mb: 3 }}>
        {icon}
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
        {description}
      </Typography>

      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;