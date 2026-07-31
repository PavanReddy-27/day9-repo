// ====================================
// File: src/pages/Manager/Dashboard.tsx
// ====================================

import {
  Avatar,
  Box,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

import GroupsIcon from "@mui/icons-material/Groups";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import InsightsIcon from "@mui/icons-material/Insights";

import { useAppSelector } from "../../hooks/redux";

const ManagerDashboard = () => {
  const { user } = useAppSelector(
    (state) => state.auth
  );

  const cards = [
    {
      title: "Team Management",
      description:
        "Manage team members, assignments, and department activities.",
      icon: (
        <GroupsIcon
          color="primary"
          fontSize="large"
        />
      ),
    },
    {
      title: "Performance",
      description:
        "Track team productivity, KPIs, and performance trends.",
      icon: (
        <TrendingUpIcon
          color="primary"
          fontSize="large"
        />
      ),
    },
    {
      title: "Task Monitoring",
      description:
        "Monitor task completion, pending work, and deadlines.",
      icon: (
        <AssignmentTurnedInIcon
          color="primary"
          fontSize="large"
        />
      ),
    },
    {
      title: "Insights",
      description:
        "View workforce insights and department statistics.",
      icon: (
        <InsightsIcon
          color="primary"
          fontSize="large"
        />
      ),
    },
  ];

  return (
    <Box>
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: 3,
          mb: 4,
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2 }}
        >
          <Avatar
            sx={{
              bgcolor: "success.main",
              width: 64,
              height: 64,
            }}
          >
            M
          </Avatar>

          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700 }}
            >
              Welcome, {user?.username}
            </Typography>

            <Typography color="text.secondary">
              Manager Dashboard
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body1">
          Monitor team performance, manage employees,
          review department progress, and make
          data-driven decisions from one place.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 3 }}
            key={card.title}
          >
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 3,
                height: "100%",
              }}
            >
              <Box sx={{ mb: 2 }}>
                {card.icon}
              </Box>

              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 1 }}
              >
                {card.title}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {card.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ManagerDashboard;