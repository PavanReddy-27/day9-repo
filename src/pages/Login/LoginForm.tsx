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

  const [username, setUsername] =
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
    if (!username.trim()) {
      dispatch(
        loginFailure(
          "Username is required."
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
        navigate(
          "/admin/dashboard",
          {
            replace: true,
          }
        );
        break;

      case "HR":
        navigate(
          "/hr/dashboard",
          {
            replace: true,
          }
        );
        break;

      case "Manager":
        navigate(
          "/manager/dashboard",
          {
            replace: true,
          }
        );
        break;

      case "Employee":
        navigate(
          "/employee/dashboard",
          {
            replace: true,
          }
        );
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
        email: username.trim(),
        password,
        rememberMe,
      } as unknown as LoginRequest;

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

  const handleUsernameChange = (
    value: string
  ) => {
    setUsername(value);

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
        gap: 2.5,
      }}
    >
      <Box className="form-header">
        <Box className="lock-icon-container">
          <LockOutlinedIcon fontSize="small" />
        </Box>
        <div className="form-overline">
          Secure Sign In
        </div>
        <h2 className="form-heading">
          Welcome back
        </h2>
        <p className="form-subtitle">
          Select a role, then sign in to its permitted workspace.
        </p>
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

            // Auto-fill logic based on selected role (matches seeded credentials)
            if (selectedRole === "Admin") {
              setUsername("admin@thestackly.com");
              setPassword("Password123!");
            } else if (selectedRole === "HR") {
              setUsername("hr@thestackly.com");
              setPassword("Password123!");
            } else if (selectedRole === "Manager") {
              setUsername("manager@thestackly.com");
              setPassword("Password123!");
            } else if (selectedRole === "Employee") {
              setUsername("employee@thestackly.com");
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
        label="Username"
        placeholder="Enter your username"
        value={username}
        onChange={(e) =>
          handleUsernameChange(
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
          background: "linear-gradient(135deg, rgba(59, 105, 120, 0.9) 0%, rgba(36, 70, 82, 1) 100%)",
          boxShadow: "0 10px 20px rgba(59, 105, 120, 0.2)",
          "&:hover": {
            background: "linear-gradient(135deg, rgba(36, 70, 82, 1) 0%, rgba(20, 50, 60, 1) 100%)",
            boxShadow: "0 12px 24px rgba(59, 105, 120, 0.3)",
          },
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