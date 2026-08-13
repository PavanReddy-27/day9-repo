// ====================================
// File: src/pages/Login/LoginForm.tsx
// Phase 1/2
// ====================================

import {
  useState,
  type FormEvent,
} from "react";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";

import {
  Visibility,
  VisibilityOff,
  LockOutlined as LockOutlinedIcon,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import {
  useAppDispatch,
  useAppSelector,
} from "../../hooks/redux";

import authApi from "../../services/authApi";

import type {
  LoginRequest,
} from "../../types/auth";

import {
  loginStart,
  loginSuccess,
  loginFailure,
  clearError,
} from "../../redux/authSlice";

const LoginForm = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const {
    isLoading,
    error,
  } = useAppSelector(
    (state) => state.auth
  );

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState("");

  const [rememberMe, setRememberMe] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [capsLock, setCapsLock] =
    useState(false);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      dispatch(
        loginFailure(
          "Email is required."
        )
      );
      return false;
    }

    if (!password.trim()) {
      dispatch(
        loginFailure(
          "Password is required."
        )
      );
      return false;
    }

    dispatch(clearError());

    return true;
  };

  const navigateByRole = (
    role: string
  ) => {
    switch (role) {
      case "Admin":
        navigate("/admin/dashboard", { replace: true });
        break;

      case "HR":
        navigate("/hr/dashboard", { replace: true });
        break;

      case "Manager":
        navigate("/manager/dashboard", { replace: true });
        break;



      case "Employee":
        navigate("/employee/dashboard", { replace: true });
        break;

      default:
        navigate("/login");
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    dispatch(loginStart());

    try {
      const payload: LoginRequest = {
        email: email.trim(),

        password,

        rememberMe,
      };

      const response =
        await authApi.login(
          payload
        );

      dispatch(
        loginSuccess({
          response,
          rememberMe,
        })
      );

      navigateByRole(
        response.user.role
      );
    } catch (error) {
      dispatch(
        loginFailure(
          error instanceof Error
            ? error.message
            : "Unable to login."
        )
      );
    }
  };

  const handleEmailChange = (
    value: string
  ) => {
    setEmail(value);

    if (error) {
      dispatch(clearError());
    }
  };

  const handlePasswordChange = (
    value: string
  ) => {
    setPassword(value);

    if (error) {
      dispatch(clearError());
    }
  };

    return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Box className="form-header">
        <Box className="lock-icon-container">
          <LockOutlinedIcon fontSize="small" />
        </Box>
        <Typography className="form-overline">
          Secure Sign In
        </Typography>
        <Typography className="form-heading">
          Welcome back
        </Typography>
        <Typography className="form-subtitle">
          Select a role, then sign in to its permitted workspace.
        </Typography>
      </Box>
      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}

      <FormControl fullWidth>
        <InputLabel id="role-select-label">Select Role for Demo</InputLabel>
        <Select
          labelId="role-select-label"
          value={role}
          label="Select Role for Demo"
          onChange={(e) => {
            const selectedRole = e.target.value;
            setRole(selectedRole);
            if (error) dispatch(clearError());
            
            // Auto-fill logic based on selected role
            if (selectedRole === "Admin") {
              setEmail("admin@thestackly.com");
              setPassword("Password123!");
            } else if (selectedRole === "HR") {
              setEmail("hr@thestackly.com");
              setPassword("Password123!");
            } else if (selectedRole === "Manager") {
              setEmail("manager@thestackly.com");
              setPassword("Password123!");
            } else if (selectedRole === "Employee") {
              setEmail("employee@thestackly.com");
              setPassword("Password123!");
            }
          }}
        >
          <MenuItem value="Admin">Admin</MenuItem>
          <MenuItem value="HR">HR</MenuItem>
          <MenuItem value="Manager">Manager</MenuItem>

          <MenuItem value="Employee">Employee</MenuItem>
        </Select>
      </FormControl>

      <TextField
        autoFocus
        fullWidth
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) =>
          handleEmailChange(
            e.target.value
          )
        }
      />

      <FormControl fullWidth>
        <InputLabel>
          Password
        </InputLabel>

        <OutlinedInput
          label="Password"
          type={
            showPassword
              ? "text"
              : "password"
          }
          value={password}
          onChange={(e) =>
            handlePasswordChange(
              e.target.value
            )
          }
          onKeyUp={(e) =>
            setCapsLock(
              e.getModifierState(
                "CapsLock"
              )
            )
          }
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
              >
                {showPassword ? (
                  <VisibilityOff />
                ) : (
                  <Visibility />
                )}
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>

      {capsLock && (
        <Typography
          color="warning.main"
          variant="body2"
        >
          Caps Lock is ON
        </Typography>
      )}

      <FormControlLabel
        control={
          <Checkbox
            checked={rememberMe}
            onChange={(e) =>
              setRememberMe(
                e.target.checked
              )
            }
          />
        }
        label="Remember Me"
      />
      

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={isLoading}
        sx={{
          py: 1.4,
          fontWeight: 600,
          fontSize: 16,
          textTransform: "none",
          borderRadius: 2,
        }}
      >
        {isLoading ? (
          <>
            <CircularProgress
              size={20}
              sx={{
                color: "var(--text-h)",
                mr: 1,
              }}
            />
            Signing In...
          </>
        ) : (
          "Enter workspace →"
        )}
      </Button>
    </Box>
  );
};

export default LoginForm;