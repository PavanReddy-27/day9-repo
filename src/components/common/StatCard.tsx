// ====================================
// File: src/components/common/StatCard.tsx
// ====================================

import type { ReactNode } from "react";

import {
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: string;
  trend?: number;
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color = "#1976d2",
  trend,
}: StatCardProps) => {
  const positive = trend !== undefined && trend >= 0;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
        transition: "0.25s",

        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            sx={{ fontWeight: 700, mt: 1 }}
          >
            {value}
          </Typography>

          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            backgroundColor: `${color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
          }}
        >
          {icon}
        </Box>
      </Stack>

      {trend !== undefined && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", mt: 3 }}
        >
          {positive ? (
            <TrendingUpIcon
              sx={{
                color: "success.main",
                fontSize: 20,
              }}
            />
          ) : (
            <TrendingDownIcon
              sx={{
                color: "error.main",
                fontSize: 20,
              }}
            />
          )}

          <Typography
            sx={{ fontWeight: 600, color: positive ? "success.main" : "error.main" }}
          >
            {positive ? "+" : ""}
            {trend}%
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            vs last month
          </Typography>
        </Stack>
      )}
    </Paper>
  );
};

export default StatCard;