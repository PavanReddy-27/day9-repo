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
  Groups,
  AssignmentTurnedIn,
  Assessment,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";
import "./WelcomeBanner.css";

interface WelcomeBannerProps {
  teamCount?: number;
  pendingLeavesCount?: number;
  healthScore?: number;
}

const WelcomeBanner = ({
  teamCount = 0,
  pendingLeavesCount = 0,
  healthScore = 0,
}: WelcomeBannerProps) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const managerName = user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Manager";
  const initials = managerName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "M";
  const deptName = user?.department || "Department";

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
            Welcome back, {user?.firstName || managerName} 👋
          </Typography>

          <Typography className="welcome-subtitle">
            {deptName} • Manager Overview
          </Typography>

          <Typography className="welcome-description">
            Monitor real-time team headcount, review pending leave requests, and track departmental performance directly from MongoDB.
          </Typography>

          <Box className="welcome-chip-group">
            {healthScore > 0 && (
              <Chip color="success" label={`Team Health ${healthScore}%`} className="welcome-chip" />
            )}
            <Chip color="info" label={`${teamCount} Team Members`} className="welcome-chip" />
            <Chip
              color={pendingLeavesCount > 0 ? "warning" : "default"}
              label={`${pendingLeavesCount} Pending Leave${pendingLeavesCount !== 1 ? "s" : ""}`}
              className="welcome-chip"
            />
            <Chip label={`Role: ${user?.role || "Manager"}`} className="welcome-chip" />
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
              onClick={() => navigate("/manager/team")}
            >
              View Team
            </Button>

            <Button
              variant="outlined"
              startIcon={<AssignmentTurnedIn />}
              className="btn-outline"
              onClick={() => navigate("/manager/leave-requests")}
            >
              Approve Leaves
            </Button>

            <Button
              variant="outlined"
              startIcon={<Assessment />}
              className="btn-outline"
              onClick={() => navigate("/manager/performance")}
            >
              Performance
            </Button>
          </Stack>
        </Box>

        <Box className="welcome-profile">
          <Avatar className="manager-avatar">
            {initials}
          </Avatar>

          <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--text-h)" }}>
            {managerName}
          </Typography>

          <Typography className="manager-role">
            {user?.role || "Manager"}
          </Typography>

          <Typography
            variant="body2"
            className="login-title"
          >
            Active Session
          </Typography>

          <Typography sx={{ fontWeight: 600, color: "var(--text-h)" }}>
            {user?.email || "Authenticated"}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default WelcomeBanner;