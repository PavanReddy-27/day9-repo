import { Box, Typography, Paper } from "@mui/material";

export default function Roles() {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5">Roles & Permissions</Typography>
        <Typography variant="body1">Manage system roles and access permissions.</Typography>
      </Paper>
    </Box>
  );
}
