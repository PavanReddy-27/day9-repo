// ====================================
// File: src/pages/HR/Dashboard.tsx
// ====================================

import {
  Avatar,
  Box,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import GroupsIcon from "@mui/icons-material/Groups";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import SchoolIcon from "@mui/icons-material/School";

import { useAppSelector } from "../../hooks/redux";

const HRDashboard = () => {
  const { user } = useAppSelector(
    (state) => state.auth
  );

  const cards = [
    {
      title: "Recruitment",
      description:
        "Track hiring progress, interview schedules, and new employee onboarding.",
      icon: (
        <PersonAddAlt1Icon
          color="primary"
          fontSize="large"
        />
      ),
    },
    {
      title: "Employee Records",
      description:
        "Maintain employee information, departments, and workforce data.",
      icon: (
        <GroupsIcon
          color="primary"
          fontSize="large"
        />
      ),
    },
    {
      title: "Attendance",
      description:
        "Monitor employee attendance, leave requests, and work schedules.",
      icon: (
        <EventAvailableIcon
          color="primary"
          fontSize="large"
        />
      ),
    },
    {
      title: "Training",
      description:
        "Manage employee learning programs and skill development.",
      icon: (
        <SchoolIcon
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
              bgcolor: "secondary.main",
              width: 64,
              height: 64,
            }}
          >
            HR
          </Avatar>

          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700 }}
            >
              Welcome, {user?.username}
            </Typography>

            <Typography color="text.secondary">
              Human Resources Dashboard
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body1">
          Manage recruitment, employee records,
          attendance, onboarding, and workforce
          development from one place.
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

export default HRDashboard;