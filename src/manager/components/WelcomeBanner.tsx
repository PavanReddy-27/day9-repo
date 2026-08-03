import {
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  Download,
  Groups,
  AssignmentTurnedIn,
} from "@mui/icons-material";

import "./WelcomeBanner.css";

const WelcomeBanner = () => {
  return (
    <Paper elevation={3} className="welcome-banner">
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={4}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "stretch", lg: "center" },
        }}
      >
        <Box className="welcome-content">
          <Typography variant="h4" className="welcome-title">
            Good Morning 👋
          </Typography>

          <Typography className="welcome-subtitle">
            Welcome back, Engineering Manager
          </Typography>

          <Typography className="welcome-description">
            Your team's productivity increased by
            <strong> 8%</strong> this week. Five leave requests are waiting
            for your approval, and overall team health remains excellent.
          </Typography>

          <Box className="welcome-chip-group">
            <Chip color="success" label="Team Health 91%" className="welcome-chip" />
            <Chip color="info" label="48 Team Members" className="welcome-chip" />
            <Chip color="warning" label="5 Pending Leaves" className="welcome-chip" />
            <Chip label="2 Meetings Today" className="welcome-chip" />
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            className="welcome-buttons"
          >
            <Button
              variant="contained"
              startIcon={<Groups />}
              className="btn-primary"
            >
              View Team
            </Button>

            <Button
              variant="outlined"
              startIcon={<AssignmentTurnedIn />}
              className="btn-outline"
            >
              Approve Leaves
            </Button>

            <Button
              variant="outlined"
              startIcon={<Download />}
              className="btn-outline"
            >
              Export Report
            </Button>
          </Stack>
        </Box>

        <Box className="welcome-profile">
          <Avatar className="manager-avatar">
            SK
          </Avatar>

          <Typography variant="h6" sx={{ fontWeight: 700, color:"white" }}>
            Sridhika kodupuganti
          </Typography>

          <Typography className="manager-role">
              Manager
          </Typography>

          <Typography
            variant="body2"
            className="login-title"
          >
            Last Login
          </Typography>

          <Typography sx={{ fontWeight: 600, color: "white" }}>
            Today • 09:15 AM
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default WelcomeBanner;