// ====================================
// File: src/pages/Login/Login.tsx
// ====================================

import { useEffect } from "react";
import {
  Box,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

import { useAppSelector } from "../../hooks/redux";
import LoginForm from "./LoginForm";
import companyLogo from "../../assets/company-logo.png";

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

      case "Team Lead":
        navigate("/teamlead/dashboard", {
          replace: true,
        });
        break;

      case "Employee":
        navigate("/employee/dashboard", {
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
      {/* Left Panel - Branding */}
      <Box className="login-left">
        <Box className="login-logo">
          <img src={companyLogo} alt="Workforce Analytics" />
        </Box>

        <Box className="login-branding">
          <Typography className="login-overline">
            Workforce Intelligence Platform
          </Typography>
          
          <Typography className="login-heading">
            Decisions get better when access stays intentional.
          </Typography>
          
          <Typography className="login-description">
            One secure workspace for workforce visibility, role-based operations, and department-aware insights.
          </Typography>
        </Box>

        <Box className="login-footer-note">
          <VerifiedUserIcon fontSize="small" sx={{ opacity: 0.8 }} />
          <span>Session persistence • RBAC • Department scope</span>
        </Box>
      </Box>

      {/* Right Panel - Form */}
      <Box className="login-right">
        <Box className="login-form-wrapper">
          <LoginForm />

          <Typography className="login-footer">
            © {new Date().getFullYear()} Workforce Analytics Dashboard
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;