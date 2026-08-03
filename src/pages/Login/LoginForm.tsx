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
} from "@mui/material";

import {
  Visibility,
  VisibilityOff,
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
        username:
          username.trim(),

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
        gap: 3,
      }}
    >
      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}

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
        }}
      >
        {isLoading ? (
          <>
            <CircularProgress
              size={20}
              sx={{
                color: "#fff",
                mr: 1,
              }}
            />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </Box>
  );
};

export default LoginForm;