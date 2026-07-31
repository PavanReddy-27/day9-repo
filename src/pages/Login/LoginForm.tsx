import { useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { AppDispatch, RootState } from "../../redux/store";
import type { LoginPayload } from "../../services/authApi";

import authApi from "../../services/authApi";

import {
  loginStart,
  loginSuccess,
  loginFailure,
  clearError,
} from "../../redux/authSlice";

const LoginForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] =
    useState(false);
  const [showPassword, setShowPassword] =
    useState(false);
  const [capsLock, setCapsLock] =
    useState(false);

  const validate = () => {
    if (!username.trim()) {
      dispatch(loginFailure("Username is required."));
      return false;
    }

    if (!password.trim()) {
      dispatch(loginFailure("Password is required."));
      return false;
    }

    dispatch(clearError());

    return true;
  };

  const handleLogin = (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!validate()) return;

    dispatch(loginStart());

    setTimeout(() => {
      try {
        const payload: LoginPayload = {
          username,
          password,
          rememberMe,
        };

        const user = authApi.login(payload);

        dispatch(
          loginSuccess({
            user,
            rememberMe,
          })
        );

        navigate("/dashboard", {
          replace: true,
        });
      } catch (err) {
        dispatch(
          loginFailure(
            err instanceof Error
              ? err.message
              : "Login failed."
          )
        );
      }
    }, 500);
  };

  return (
    <Box
      component="form"
      onSubmit={handleLogin}
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
        label="Username"
        fullWidth
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          dispatch(clearError());
        }}
      />

      <FormControl fullWidth>
        <InputLabel>Password</InputLabel>

        <OutlinedInput
          label="Password"
          type={
            showPassword
              ? "text"
              : "password"
          }
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            dispatch(clearError());
          }}
          onKeyUp={(e) =>
            setCapsLock(
              e.getModifierState("CapsLock")
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
          Caps Lock is ON.
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
        disabled={isLoading}
        fullWidth
        size="large"
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