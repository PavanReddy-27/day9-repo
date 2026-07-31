// ====================================
// File: src/pages/Login/Login.tsx
// ====================================

import { useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useAppSelector } from "../../hooks/redux";
import LoginForm from "./LoginForm";

import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const {
    isAuthenticated,
    user,
  } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    switch (user.role) {
      case "Admin":
        navigate("/admin/dashboard", {
          replace: true,
        });
        break;

      case "HR":
        navigate("/hr/dashboard", {
          replace: true,
        });
        break;

      case "Manager":
        navigate("/manager/dashboard", {
          replace: true,
        });
        break;

      default:
        navigate("/login", {
          replace: true,
        });
    }
  }, [
    isAuthenticated,
    user,
    navigate,
  ]);

  return (
    <Box className="login-container">
      <Paper
        elevation={0}
        className="login-card"
      >
        <Box
          sx={{ display: "flex", justifyContent: "center", mb: 3 }}
        >
          <img
            src="https://thestackly.com/assets/imgs/logo-stackly%20(1).png"
            alt="Stackly"
            style={{
              width: 220,
              height: "auto",
            }}
          />
        </Box>

        <Typography
          variant="h4"
          align="center"
          className="login-title"
          gutterBottom
        >
          Workforce Analytics
        </Typography>

        <Typography
          align="center"
          className="login-subtitle"
          sx={{ mb: 4 }}
        >
          Sign in to continue to Workforce Analytics Dashboard
        </Typography>

        <LoginForm />

        <Divider
          sx={{
            my: 4,
          }}
        />

        <Typography
          align="center"
          className="login-footer"
        >
          © {new Date().getFullYear()}
          {" "}
          Workforce Analytics Dashboard
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;