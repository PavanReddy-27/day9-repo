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

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@thestackly.com", password: "Password123!", icon: "👑" },
  { role: "HR", email: "hr@thestackly.com", password: "Password123!", icon: "💼" },
  { role: "Manager", email: "manager@thestackly.com", password: "Password123!", icon: "👔" },
  { role: "Employee", email: "employee@thestackly.com", password: "Password123!", icon: "👤" },
];

const LoginForm = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const {
    isLoading,
    error,
    mfaRequired,
    tempToken,
  } = useAppSelector(
    (state) => state.auth
  );

  const [mfaCode, setMfaCode] = useState("");

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [selectedDemoRole, setSelectedDemoRole] =
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
        navigate("/admin/dashboard", {
          replace: true,
        });
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
        navigate("/manager/dashboard", {
          replace: true,
        });
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

  const performLogin = async (loginEmail: string, loginPass: string) => {
    dispatch(clearError());
    dispatch(loginStart());

    try {
      const payload: LoginRequest = {
        email: loginEmail.trim(),
        password: loginPass,
        rememberMe,
      } as unknown as LoginRequest;

      const response = await authApi.login(payload);

      dispatch(
        loginSuccess({
          response,
          rememberMe,
        })
      );

      if (!response.mfaRequired && response.user) {
        navigateByRole(response.user.role);
      }
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

  const handleFillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setSelectedDemoRole(acc.role);
    setUsername(acc.email);
    setPassword(acc.password);
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    await performLogin(username, password);
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

  const handleMfaSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mfaCode.trim() || mfaCode.length !== 6) {
      dispatch(loginFailure("Please enter a valid 6-digit code."));
      return;
    }
    dispatch(loginStart());
    try {
      const response = await authApi.verifyLoginMfa(tempToken!, mfaCode);
      dispatch(loginSuccess({ response, rememberMe }));
      if (response.user) navigateByRole(response.user.role);
    } catch (err) {
      dispatch(
        loginFailure(err instanceof Error ? err.message : "Invalid MFA code.")
      );
    }
  };

  if (mfaRequired) {
    return (
      <Box
        component="form"
        onSubmit={handleMfaSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box className="form-header">
          <Box className="lock-icon-container">
            <LockOutlinedIcon fontSize="small" />
          </Box>
          <div className="form-overline">Two-Factor Authentication</div>
          <h2 className="form-heading">Enter Verification Code</h2>
          <p className="form-subtitle">Enter the 6-digit code from Google Authenticator.</p>
        </Box>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          autoFocus
          fullWidth
          size="small"
          label="Authenticator Code"
          placeholder="123456"
          value={mfaCode}
          onChange={(e) => {
            setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6));
            if (error) dispatch(clearError());
          }}
          slotProps={{ htmlInput: { maxLength: 6, style: { textAlign: 'center', letterSpacing: '8px', fontSize: '20px' } } }}
        />

        <Button
          type="submit"
          variant="contained"
          size="medium"
          fullWidth
          disabled={isLoading || mfaCode.length !== 6}
          sx={{
            py: 1.1,
            fontWeight: 600,
            fontSize: 15,
            textTransform: "none",
            borderRadius: 2,
            background: "linear-gradient(135deg, rgba(59, 105, 120, 0.9) 0%, rgba(36, 70, 82, 1) 100%)",
            boxShadow: "0 8px 16px rgba(59, 105, 120, 0.2)",
            "&:hover": {
              background: "linear-gradient(135deg, rgba(36, 70, 82, 1) 0%, rgba(20, 50, 60, 1) 100%)",
              boxShadow: "0 10px 20px rgba(59, 105, 120, 0.3)",
            },
          }}
        >
          {isLoading ? (
            <>
              <CircularProgress size={20} sx={{ color: "var(--text-h)", mr: 1 }} />
              Verifying...
            </>
          ) : (
            "Verify Code"
          )}
        </Button>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
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
          Sign in to your authorized workspace.
        </p>
      </Box>
      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}

      {/* Demo Credentials Pill Bar */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 0.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--primary-light, #38bdf8)",
            }}
          >
            Demo Credentials
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "0.68rem", color: "var(--text-light)" }}>
            Click role to auto-fill
          </Typography>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0.75 }}>
          {DEMO_ACCOUNTS.map((acc) => (
            <Button
              key={acc.role}
              size="small"
              type="button"
              variant={selectedDemoRole === acc.role ? "contained" : "outlined"}
              onClick={() => handleFillDemo(acc)}
              sx={{
                py: 0.35,
                px: 0.5,
                minWidth: 0,
                fontSize: "0.72rem",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "8px",
                borderColor: selectedDemoRole === acc.role ? "var(--primary)" : "var(--border)",
                background: selectedDemoRole === acc.role ? "var(--primary)" : "var(--surface)",
                color: selectedDemoRole === acc.role ? "#fff" : "var(--text)",
                boxShadow: "none",
                "&:hover": {
                  background: selectedDemoRole === acc.role ? "var(--primary-dark)" : "var(--surface-hover)",
                  boxShadow: "none",
                },
              }}
            >
              {acc.icon} {acc.role}
            </Button>
          ))}
        </Box>
      </Box>

      <TextField
        autoFocus
        fullWidth
        size="small"
        label="Username"
        placeholder="Enter your username"
        value={username}
        onChange={(e) =>
          handleUsernameChange(
            e.target.value
          )
        }
      />

      <FormControl fullWidth size="small">
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
        size="medium"
        fullWidth
        disabled={isLoading}
        sx={{
          py: 1.1,
          fontWeight: 600,
          fontSize: 15,
          textTransform: "none",
          borderRadius: 2,
          background: "linear-gradient(135deg, rgba(59, 105, 120, 0.9) 0%, rgba(36, 70, 82, 1) 100%)",
          boxShadow: "0 8px 16px rgba(59, 105, 120, 0.2)",
          "&:hover": {
            background: "linear-gradient(135deg, rgba(36, 70, 82, 1) 0%, rgba(20, 50, 60, 1) 100%)",
            boxShadow: "0 10px 20px rgba(59, 105, 120, 0.3)",
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