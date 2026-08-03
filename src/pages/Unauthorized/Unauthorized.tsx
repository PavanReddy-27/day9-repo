// ====================================
// File: src/pages/Unauthorized/Unauthorized.tsx
// ====================================

import {
  Box,
  Button,
  Paper,
  Typography,
} from "@mui/material";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { useNavigate } from "react-router-dom";

import authApi from "../../services/authApi";

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleDashboard = () => {
    navigate(authApi.getDashboardRoute(), {
      replace: true,
    });
  };

  const handleLogin = () => {
    authApi.logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "var(--bg)",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: 500,
          maxWidth: "100%",
          p: 5,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <LockOutlinedIcon
          color="error"
          sx={{
            fontSize: 70,
            mb: 2,
          }}
        />

        <Typography
          variant="h4"
          sx={{ fontWeight: 700, mb: 1 }}
        >
          Access Denied
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mb: 4,
          }}
        >
          You don't have permission to
          access this page.
        </Typography>

        <Box
          sx={{ display: "flex", gap: 2, justifyContent: "center" }}
        >
          <Button
            variant="contained"
            onClick={handleDashboard}
          >
            Dashboard
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={handleLogin}
          >
            Logout
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Unauthorized;