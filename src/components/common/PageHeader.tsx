// ====================================
// File: src/components/common/PageHeader.tsx
// ====================================

import {
  Box,
  Stack,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

const PageHeader = ({
  title,
  subtitle,
  actions,
}: PageHeaderProps) => {
  return (
    <Box
      sx={{
        mb: 4,
      }}
    >
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        sx={{
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
        }}
        spacing={2}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700 }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {actions && (
          <Box>
            {actions}
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default PageHeader;