import { Box, Typography, Paper } from "@mui/material";

export default function AuditLogs() {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5">Audit Logs</Typography>
        <Typography variant="body1">View system activity logs and historical data changes.</Typography>
      </Paper>
    </Box>
  );
}
