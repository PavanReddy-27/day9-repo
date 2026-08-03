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

import "./TeamHealthCard.css";

const metrics = [
  {
    title: "Attendance",
    value: 92,
    color: "#16A34A",
  },
  {
    title: "Performance",
    value: 89,
    color: "#2563EB",
  },
  {
    title: "Engagement",
    value: 94,
    color: "#7C3AED",
  },
  {
    title: "Productivity",
    value: 88,
    color: "#0EA5E9",
  },
];

const TeamHealthCard = () => {
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
          label="Excellent"
          color="success"
          size="small"
        />
      </Stack>

      <Box className="health-score">
        <Favorite className="health-icon" />

        <Typography
          variant="h3"
          className="health-percentage"
        >
          91%
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