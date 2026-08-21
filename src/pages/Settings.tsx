import { useState } from "react";
import { useAppSelector } from "../hooks/redux";
import authApi from "../services/authApi";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Box
} from "@mui/material";
import "./Settings.css";

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const user = useAppSelector((state) => state.auth.user);
  
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled || false);
  const [mfaSetupData, setMfaSetupData] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);
  const [mfaDialogOpen, setMfaDialogOpen] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState("");

  const handleEnableMfaClick = async () => {
    setMfaError("");
    setMfaLoading(true);
    setMfaDialogOpen(true);
    try {
      const data = await authApi.generateMfa();
      setMfaSetupData(data);
    } catch (err) {
      setMfaError("Failed to generate MFA setup. Please try again.");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (!mfaSetupData || mfaCode.length !== 6) {
      setMfaError("Please enter a valid 6-digit code.");
      return;
    }
    setMfaError("");
    setMfaLoading(true);
    try {
      await authApi.enableMfa(mfaSetupData.secret, mfaCode);
      setMfaEnabled(true);
      setMfaDialogOpen(false);
      setMfaSetupData(null);
      setMfaCode("");
    } catch (err) {
      setMfaError("Invalid verification code. Please try again.");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!window.confirm("Are you sure you want to disable Google Authenticator?")) return;
    try {
      await authApi.disableMfa();
      setMfaEnabled(false);
    } catch (err) {
      alert("Failed to disable MFA.");
    }
  };

  const closeDialog = () => {
    setMfaDialogOpen(false);
    setMfaSetupData(null);
    setMfaCode("");
  };

  return (
    <section className="page-content">
      <div className="settings-page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your dashboard preferences and account settings.</p>
        </div>
      </div>

      <div className="settings-card">
        <h2>Security Settings</h2>
        
        <div className="settings-row">
          <div className="settings-row-info">
            <strong>Google Authenticator (2FA)</strong>
            <p>Enhance your account security by requiring a code from Google Authenticator.</p>
          </div>
          <div>
            {mfaEnabled ? (
              <button className="btn-mfa-disable" onClick={handleDisableMfa}>
                Disable 2FA
              </button>
            ) : (
              <button className="btn-mfa-enable" onClick={handleEnableMfaClick}>
                Enable 2FA
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h2>Application Settings</h2>

        <div className="settings-row">
          <div className="settings-row-info">
            <strong>Email Notifications</strong>
            <p>Receive workforce analytics notifications by email.</p>
          </div>

          <label className="settings-switch">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(event) => setNotifications(event.target.checked)}
            />
            <span className="settings-slider" />
          </label>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <strong>Dark Mode</strong>
            <p>Use dark mode for the application interface.</p>
          </div>

          <label className="settings-switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(event) => setDarkMode(event.target.checked)}
            />
            <span className="settings-slider" />
          </label>
        </div>
      </div>

      <Dialog open={mfaDialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Set Up Google Authenticator</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', mt: 1 }}>
            {mfaLoading && !mfaSetupData ? (
              <CircularProgress />
            ) : mfaSetupData ? (
              <>
                <Typography variant="body1" align="center">
                  1. Install Google Authenticator on your phone.
                  <br />
                  2. Scan the QR code below.
                </Typography>
                <img src={mfaSetupData.qrCodeDataUrl} alt="MFA QR Code" style={{ width: 200, height: 200 }} />
                <Typography variant="body2" color="textSecondary" align="center">
                  Or enter this code manually: <strong>{mfaSetupData.secret}</strong>
                </Typography>
                
                {mfaError && <Alert severity="error" sx={{ width: '100%' }}>{mfaError}</Alert>}
                
                <TextField
                  fullWidth
                  label="Enter 6-digit code"
                  variant="outlined"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  slotProps={{ htmlInput: { maxLength: 6, style: { textAlign: 'center', letterSpacing: '4px', fontSize: '20px' } } }}
                  sx={{ mt: 2 }}
                />
              </>
            ) : mfaError ? (
              <Alert severity="error" sx={{ width: '100%' }}>{mfaError}</Alert>
            ) : null}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          {mfaSetupData && (
            <Button 
              onClick={handleVerifyMfa} 
              variant="contained" 
              disabled={mfaCode.length !== 6 || mfaLoading}
            >
              {mfaLoading ? <CircularProgress size={24} /> : "Verify and Enable"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </section>
  );
}

export default Settings;
