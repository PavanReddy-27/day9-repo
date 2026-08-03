import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Switch,
  TextField,
  MenuItem,
  Slider,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Business,
  Security,
  NotificationsActive,
  Tune,
} from "@mui/icons-material";

const timezones = [
  "UTC", "UTC+5:30 (IST)", "UTC-5 (EST)", "UTC-8 (PST)", "UTC+1 (CET)", "UTC+9 (JST)",
];

const SettingSection = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)", mb: 3 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
      <Box sx={{ color: "var(--primary)" }}>{icon}</Box>
      <Typography sx={{ color: "var(--text-h)", fontWeight: 700, fontSize: 17 }}>{title}</Typography>
    </Box>
    <Divider sx={{ borderColor: "var(--border)", mb: 3 }} />
    {children}
  </Paper>
);

const SettingRow = ({ label, description, control }: { label: string; description: string; control: React.ReactNode }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", py: 1.5, gap: 2, flexWrap: "wrap" }}>
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ color: "var(--text-h)", fontWeight: 500, fontSize: 14 }}>{label}</Typography>
      <Typography sx={{ color: "var(--text-light)", fontSize: 12, mt: 0.3 }}>{description}</Typography>
    </Box>
    <Box sx={{ flexShrink: 0 }}>{control}</Box>
  </Box>
);

const AdminSettings = () => {
  const [saved, setSaved] = useState(false);

  // General
  const [company, setCompany] = useState("Workforce Analytics Corp");
  const [timezone, setTimezone] = useState("UTC+5:30 (IST)");
  const [language, setLanguage] = useState("English");

  // Security
  const [twoFA, setTwoFA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(8);
  const [passwordExpiry, setPasswordExpiry] = useState(90);
  const [loginAttempts, setLoginAttempts] = useState(5);

  // Notifications
  const [emailLeave, setEmailLeave] = useState(true);
  const [emailNewUser, setEmailNewUser] = useState(true);
  const [emailReport, setEmailReport] = useState(false);
  const [emailSecurity, setEmailSecurity] = useState(true);

  // Display
  const [compactMode, setCompactMode] = useState(false);
  const [animations, setAnimations] = useState(true);
  const [auditLogging, setAuditLogging] = useState(true);

  const handleSave = () => setSaved(true);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "var(--text-h)", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
            <SettingsIcon fontSize="large" sx={{ color: "var(--primary)" }} /> Application Settings
          </Typography>
          <Typography sx={{ color: "var(--text-light)", mt: 1 }}>
            Configure global application preferences, security policies, and notification rules.
          </Typography>
        </Box>
        <Button variant="contained" sx={{ borderRadius: 2, px: 4 }} onClick={handleSave}>
          Save All Changes
        </Button>
      </Box>

      {/* General Settings */}
      <SettingSection icon={<Business />} title="General">
        <SettingRow
          label="Company Name"
          description="Appears throughout the application in headers and reports."
          control={
            <TextField size="small" value={company} onChange={(e) => setCompany(e.target.value)} sx={{ width: 260 }} />
          }
        />
        <Divider sx={{ borderColor: "var(--border)", my: 1 }} />
        <SettingRow
          label="Timezone"
          description="Default timezone used for timestamps and scheduling."
          control={
            <TextField select size="small" value={timezone} onChange={(e) => setTimezone(e.target.value)} sx={{ width: 200 }}>
              {timezones.map((tz) => <MenuItem key={tz} value={tz}>{tz}</MenuItem>)}
            </TextField>
          }
        />
        <Divider sx={{ borderColor: "var(--border)", my: 1 }} />
        <SettingRow
          label="Language"
          description="Application display language for all users."
          control={
            <TextField select size="small" value={language} onChange={(e) => setLanguage(e.target.value)} sx={{ width: 160 }}>
              {["English", "Spanish", "French", "German"].map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
            </TextField>
          }
        />
      </SettingSection>

      {/* Security Settings */}
      <SettingSection icon={<Security />} title="Security">
        <SettingRow
          label="Two-Factor Authentication"
          description="Require 2FA for all admin logins."
          control={<Switch checked={twoFA} onChange={(e) => setTwoFA(e.target.checked)} color="primary" />}
        />
        <Divider sx={{ borderColor: "var(--border)", my: 1 }} />
        <SettingRow
          label={`Session Timeout: ${sessionTimeout}h`}
          description="Automatically log out inactive users after the selected duration."
          control={
            <Box sx={{ width: 200 }}>
              <Slider value={sessionTimeout} min={1} max={24} step={1} onChange={(_, v) => setSessionTimeout(v as number)} />
            </Box>
          }
        />
        <Divider sx={{ borderColor: "var(--border)", my: 1 }} />
        <SettingRow
          label={`Password Expiry: ${passwordExpiry} days`}
          description="Force users to reset password after this many days."
          control={
            <Box sx={{ width: 200 }}>
              <Slider value={passwordExpiry} min={30} max={365} step={15} onChange={(_, v) => setPasswordExpiry(v as number)} />
            </Box>
          }
        />
        <Divider sx={{ borderColor: "var(--border)", my: 1 }} />
        <SettingRow
          label={`Max Login Attempts: ${loginAttempts}`}
          description="Lock account after this number of failed login attempts."
          control={
            <Box sx={{ width: 200 }}>
              <Slider value={loginAttempts} min={3} max={10} step={1} onChange={(_, v) => setLoginAttempts(v as number)} />
            </Box>
          }
        />
      </SettingSection>

      {/* Notifications */}
      <SettingSection icon={<NotificationsActive />} title="Email Notifications">
        <SettingRow
          label="Leave Approval Alerts"
          description="Send email when a leave request is submitted or approved."
          control={<Switch checked={emailLeave} onChange={(e) => setEmailLeave(e.target.checked)} color="primary" />}
        />
        <Divider sx={{ borderColor: "var(--border)", my: 1 }} />
        <SettingRow
          label="New User Registration"
          description="Notify admin when a new user account is created."
          control={<Switch checked={emailNewUser} onChange={(e) => setEmailNewUser(e.target.checked)} color="primary" />}
        />
        <Divider sx={{ borderColor: "var(--border)", my: 1 }} />
        <SettingRow
          label="Scheduled Report Delivery"
          description="Receive auto-generated reports by email on a weekly basis."
          control={<Switch checked={emailReport} onChange={(e) => setEmailReport(e.target.checked)} color="primary" />}
        />
        <Divider sx={{ borderColor: "var(--border)", my: 1 }} />
        <SettingRow
          label="Security Alerts"
          description="Immediate email on failed logins or suspicious access attempts."
          control={<Switch checked={emailSecurity} onChange={(e) => setEmailSecurity(e.target.checked)} color="error" />}
        />
      </SettingSection>

      {/* Display & Behavior */}
      <SettingSection icon={<Tune />} title="Display & Behavior">
        <SettingRow
          label="Compact Mode"
          description="Reduce spacing in tables and sidebars for denser data views."
          control={<Switch checked={compactMode} onChange={(e) => setCompactMode(e.target.checked)} color="primary" />}
        />
        <Divider sx={{ borderColor: "var(--border)", my: 1 }} />
        <SettingRow
          label="UI Animations"
          description="Enable smooth page transitions and micro-animations."
          control={<Switch checked={animations} onChange={(e) => setAnimations(e.target.checked)} color="primary" />}
        />
        <Divider sx={{ borderColor: "var(--border)", my: 1 }} />
        <SettingRow
          label="Audit Logging"
          description="Record all user actions for security compliance and audit trails."
          control={<Switch checked={auditLogging} onChange={(e) => setAuditLogging(e.target.checked)} color="primary" />}
        />
      </SettingSection>

      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSaved(false)} severity="success" variant="filled" sx={{ width: "100%" }}>
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminSettings;