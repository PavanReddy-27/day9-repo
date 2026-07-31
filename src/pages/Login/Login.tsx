import { useEffect } from "react";
import {
  Box,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { RootState } from "../../redux/store";

import LoginForm from "./LoginForm";

import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", {
        replace: true,
      });
    }
  }, [isAuthenticated, navigate]);

  return (
    <Box className="login-container">
      <Paper
        elevation={0}
        className="login-card"
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
          }}
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
          align="center"
          className="login-subtitle"
          sx={{ mb: 4 }}
        >
          Sign in to continue to Workforce Analytics Dashboard
        </Typography>

        <LoginForm />

        <Divider sx={{ my: 4 }} />

        <Typography
          className="login-footer"
        >
          Workforce Analytics Dashboard
        </Typography>

      </Paper>
    </Box>
  );
};

export default Login;