import {
  Paper,
  Typography,
  Box,
  Stack,
  Chip,
  Divider,
} from "@mui/material";

import {
  Favorite,
  TrendingUp,
  Groups,
  WarningAmber,
} from "@mui/icons-material";

import "./TeamHealthCard.css";

interface TeamHealthCardProps {
  attendanceRate?: number;
  performanceScore?: number;
  productivityScore?: number;
  skillsCoverage?: number;
  teamMembersCount?: number;
  highRiskCount?: number;
}

const TeamHealthCard = ({
  attendanceRate = 0,
  performanceScore = 0,
  productivityScore = 0,
  skillsCoverage = 0,
  teamMembersCount = 48,
  highRiskCount = 3,
}: TeamHealthCardProps) => {
  const metrics = [
    {
      title: "Attendance",
      value: Math.round(attendanceRate),
      color: "var(--success, #10b981)",
    },
    {
      title: "Performance",
      value: Math.round(performanceScore),
      color: "var(--primary, #3b82f6)",
    },
    {
      title: "Skills Coverage",
      value: Math.round(skillsCoverage),
      color: "var(--secondary, #f97316)",
    },
    {
      title: "Productivity",
      value: Math.round(productivityScore),
      color: "var(--info, #06b6d4)",
    },
  ];

  const activeValues = metrics.map((m) => m.value).filter((v) => v > 0);
  const overallScore =
    activeValues.length > 0
      ? Math.round(activeValues.reduce((a, b) => a + b, 0) / activeValues.length)
      : 0;

  const healthLabel =
    overallScore >= 85
      ? "Excellent"
      : overallScore >= 70
      ? "Good"
      : overallScore > 0
      ? "Needs Focus"
      : "No Data";

  const healthColor =
    overallScore >= 85
      ? "success"
      : overallScore >= 70
      ? "info"
      : overallScore > 0
      ? "warning"
      : "default";

  return (
    <Paper elevation={0} className="team-health-card">
      {/* Header */}
      <Stack
        direction="row"
        className="health-header"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Box className="health-header-icon">
            <Favorite sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" className="health-title">
              Team Health
            </Typography>
            <Typography variant="caption" className="health-subtitle">
              Workforce vitality & stability
            </Typography>
          </Box>
        </Stack>

        <Chip
          label={healthLabel}
          color={healthColor as any}
          size="small"
          className="health-status-chip"
        />
      </Stack>

      {/* Primary Score Banner */}
      <Box className="health-score-container">
        <Box>
          <Typography variant="caption" className="health-score-overline">
            Overall Health Score
          </Typography>
          <Stack direction="row" sx={{ alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" className="health-percentage">
              {overallScore}%
            </Typography>
            <Typography
              variant="body2"
              className={`health-score-tag ${overallScore >= 70 ? "positive" : "warning"}`}
            >
              {overallScore >= 85
                ? "Optimal condition"
                : overallScore >= 70
                ? "Healthy operation"
                : "Attention required"}
            </Typography>
          </Stack>
        </Box>

        <Box
          className={`health-badge ${overallScore >= 80 ? "badge-success" : "badge-primary"}`}
        >
          <Favorite sx={{ fontSize: 26 }} />
        </Box>
      </Box>

      {/* Progress Bars Section */}
      <Stack spacing={2} className="health-metrics-list">
        {metrics.map((item) => (
          <Box key={item.title} className="metric-item">
            <Stack
              direction="row"
              className="metric-header"
              sx={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <Typography variant="body2" className="metric-title">
                {item.title}
              </Typography>

              <Typography variant="body2" className="metric-value">
                {item.value}%
              </Typography>
            </Stack>

            <Box className="custom-progress-track">
              <Box
                className="custom-progress-bar"
                style={{
                  width: `${Math.min(100, Math.max(0, item.value))}%`,
                  backgroundColor: item.color,
                }}
              />
            </Box>
          </Box>
        ))}
      </Stack>

      {/* Summary Footer Box */}
      <Box className="health-summary">
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            className="summary-row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Groups className="summary-icon icon-primary" fontSize="small" />
              <Typography variant="body2" className="summary-label">
                Team Members
              </Typography>
            </Stack>

            <Typography className="summary-value">
              {teamMembersCount}
            </Typography>
          </Stack>

          <Divider className="summary-divider" />

          <Stack
            direction="row"
            className="summary-row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <TrendingUp className="summary-icon icon-success" fontSize="small" />
              <Typography variant="body2" className="summary-label">
                Productivity Growth
              </Typography>
            </Stack>

            <Typography className="summary-value value-growth">
              +8%
            </Typography>
          </Stack>

          <Divider className="summary-divider" />

          <Stack
            direction="row"
            className="summary-row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <WarningAmber className="summary-icon icon-warning" fontSize="small" />
              <Typography variant="body2" className="summary-label">
                High Risk Employees
              </Typography>
            </Stack>

            <Chip
              label={highRiskCount}
              size="small"
              className="risk-chip"
            />
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};

export default TeamHealthCard;