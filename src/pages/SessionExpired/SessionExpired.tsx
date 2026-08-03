// ====================================
// File: src/pages/SessionExpired/SessionExpired.tsx
// ====================================

import { useEffect } from "react";

import {
  Box,
  Button,
  Paper,
  Typography,
} from "@mui/material";

import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";

import { useNavigate } from "react-router-dom";

import authApi from "../../services/authApi";

const SessionExpired = () => {
  const navigate = useNavigate();

  useEffect(() => {
    authApi.logout();
  }, []);

  const handleLogin = () => {
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
        backgroundColor: "var(--bg)",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 500,
          width: "100%",
          p: 5,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <AccessTimeFilledIcon
          color="warning"
          sx={{
            fontSize: 72,
            mb: 2,
          }}
        />

        <Typography
          variant="h4"
          sx={{ fontWeight: 700, mb: 1 }}
        >
          Session Expired
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mb: 4,
          }}
        >
          Your login session has expired for
          security reasons.
          <br />
          Please sign in again to continue.
        </Typography>

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleLogin}
        >
          Go to Login
        </Button>
      </Paper>
    </Box>
  );
};

export default SessionExpired;