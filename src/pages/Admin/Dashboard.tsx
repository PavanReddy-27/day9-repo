// ====================================
// File: src/pages/Admin/Dashboard.tsx
// ====================================

import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Divider,
} from "@mui/material";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import GroupsIcon from "@mui/icons-material/Groups";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import AssessmentIcon from "@mui/icons-material/Assessment";

import { useAppSelector } from "../../hooks/redux";

const AdminDashboard = () => {
  const { user } = useAppSelector(
    (state) => state.auth
  );

  const cards = [
    {
      title: "Employee Management",
      description:
        "Manage employee records, departments, and organizational structure.",
      icon: <GroupsIcon fontSize="large" color="primary" />,
    },
    {
      title: "Analytics",
      description:
        "Monitor workforce analytics and organizational performance.",
      icon: <AnalyticsIcon fontSize="large" color="primary" />,
    },
    {
      title: "Reports",
      description:
        "Generate HR, workforce, and compliance reports.",
      icon: <AssessmentIcon fontSize="large" color="primary" />,
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
              bgcolor: "primary.main",
              width: 64,
              height: 64,
            }}
          >
            <AdminPanelSettingsIcon />
          </Avatar>

          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700 }}
            >
              Welcome, {user?.username}
            </Typography>

            <Typography
              color="text.secondary"
            >
              Administrator Dashboard
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body1">
          This dashboard provides complete
          administrative access to the Workforce
          Analytics System. From here you can
          manage employees, monitor analytics,
          generate reports, and configure system
          settings.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid
            size={{ xs: 12, md: 4 }}
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

export default AdminDashboard;