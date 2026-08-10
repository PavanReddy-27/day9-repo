// ====================================
// File: src/pages/Profile/Profile.tsx
// ====================================

import {
  Avatar,
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import BusinessIcon from "@mui/icons-material/Business";
import SecurityIcon from "@mui/icons-material/Security";
import EditIcon from "@mui/icons-material/Edit";

import { useAppSelector } from "../../hooks/redux";

const Profile = () => {
  const { user } = useAppSelector(
    (state) => state.auth
  );

  const profileData = [
    {
      label: "Username",
      value: user?.username ?? "-",
      icon: <PersonIcon color="primary" />,
    },
    {
      label: "Email",
      value: user?.email ?? "-",
      icon: <EmailIcon color="primary" />,
    },
    {
      label: "Role",
      value: user?.role ?? "-",
      icon: <SecurityIcon color="primary" />,
    },
    {
      label: "Employee ID",
      value: user?.id ?? "-",
      icon: <BadgeIcon color="primary" />,
    },
    {
      label: "Department",
      value: user?.department ?? "-",
      icon: <BusinessIcon color="primary" />,
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
        <Stack
          spacing={3}
          sx={{ alignItems: "center" }}
        >
          <Avatar
            sx={{
              width: 90,
              height: 90,
              bgcolor: "primary.main",
              fontSize: 32,
            }}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700 }}
            >
              {user?.username}
            </Typography>

            <Typography
              color="text.secondary"
            >
              {user?.role}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            disabled
          >
            Edit Profile
          </Button>
        </Stack>
      </Paper>

      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mb: 1 }}
        >
          Profile Information
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {profileData.map((item) => (
            <Grid
              size={{ xs: 12, md: 6 }}
              key={item.label}
            >
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  borderRadius: 2,
                }}
              >
                {item.icon}

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {item.label}
                  </Typography>

                  <Typography
                    sx={{ fontWeight: 600 }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;