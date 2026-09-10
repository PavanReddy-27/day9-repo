import {
  Paper,
  Typography,
  Box,
  Stack,
  LinearProgress,
  Chip,
} from "@mui/material";

import {
  Favorite,
  TrendingUp,
  Groups,
  WarningAmber,
} from "@mui/icons-material";

interface TeamHealthCardProps {
  attendanceRate?: number;
  performanceScore?: number;
  productivityScore?: number;
  skillsCoverage?: number;
}

const TeamHealthCard = ({
  attendanceRate = 0,
  performanceScore = 0,
  productivityScore = 0,
  skillsCoverage = 0,
}: TeamHealthCardProps) => {
  const metrics = [
    {
      title: "Attendance",
      value: Math.round(attendanceRate),
      color: "var(--success)",
    },
    {
      title: "Performance",
      value: Math.round(performanceScore),
      color: "var(--info)",
    },
    {
      title: "Skills Coverage",
      value: Math.round(skillsCoverage),
      color: "var(--secondary)",
    },
    {
      title: "Productivity",
      value: Math.round(productivityScore),
      color: "var(--info)",
    },
  ];

  const activeValues = metrics.map(m => m.value).filter(v => v > 0);
  const overallScore = activeValues.length > 0
    ? Math.round(activeValues.reduce((a, b) => a + b, 0) / activeValues.length)
    : 0;

  const healthLabel = overallScore >= 85 ? "Excellent" : overallScore >= 70 ? "Good" : overallScore > 0 ? "Needs Focus" : "No Data";
  const healthColor = overallScore >= 85 ? "success" : overallScore >= 70 ? "info" : overallScore > 0 ? "warning" : "default";

  return (
    <Paper elevation={3} className="team-health-card">
      <Stack
        direction="row"
        className="health-header"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" className="health-title">
          ❤️ Team Health
        </Typography>

        <Chip
          label={healthLabel}
          color={healthColor as any}
          size="small"
        />
      </Stack>

      <Box className="health-score">
        <Favorite className="health-icon" />

        <Typography
          variant="h3"
          className="health-percentage"
        >
          {overallScore}%
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Overall Team Health Score
        </Typography>
      </Box>

      <Stack spacing={3}>
        {metrics.map((item) => (
          <Box key={item.title}>
            <Stack
              direction="row"
              className="metric-header"
              sx={{ justifyContent: "space-between" }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 500 }}
              >
                {item.title}
              </Typography>

              <Typography
                variant="body2"
                sx={{ fontWeight: 700 }}
              >
                {item.value}%
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={item.value}
              className="health-progress"
              sx={{
                "& .MuiLinearProgress-bar": {
                  backgroundColor: item.color,
                },
              }}
            />
          </Box>
        ))}
      </Stack>

      <Box className="health-summary">
        <Stack
          direction="row"
          className="summary-row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center" }}
          >
            <Groups
              color="primary"
              fontSize="small"
            />

            <Typography variant="body2">
              Team Members
            </Typography>
          </Stack>

          <Typography sx={{ fontWeight: 700 }}>
            48
          </Typography>
        </Stack>

        <Stack
          direction="row"
          className="summary-row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center" }}
          >
            <TrendingUp
              color="success"
              fontSize="small"
            />

            <Typography variant="body2">
              Productivity Growth
            </Typography>
          </Stack>

          <Typography
            color="success.main"
            sx={{ fontWeight: 700 }}
          >
            +8%
          </Typography>
        </Stack>

        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center" }}
          >
            <WarningAmber
              color="warning"
              fontSize="small"
            />

            <Typography variant="body2">
              High Risk Employees
            </Typography>
          </Stack>

          <Typography
            color="error.main"
            sx={{ fontWeight: 700 }}
          >
            3
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
};

export default TeamHealthCard;