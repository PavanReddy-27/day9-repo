import {
  Avatar,
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  EmojiEvents,
  TrendingUp,
} from "@mui/icons-material";

import "./TopPerformers.css";

const performers = [
  {
    id: 1,
    name: "Rahul Sharma",
    role: "Senior React Developer",
    score: 98,
    productivity: 96,
    avatar: "R",
    badge: "Top Performer",
    color: "var(--warning)",
  },
  {
    id: 2,
    name: "Priya Patel",
    role: "UI/UX Designer",
    score: 95,
    productivity: 94,
    avatar: "P",
    badge: "Outstanding",
    color: "var(--text-light)",
  },
  {
    id: 3,
    name: "Anil Kumar",
    role: "Backend Developer",
    score: 92,
    productivity: 90,
    avatar: "A",
    badge: "Excellent",
    color: "var(--warning)",
  },
  {
    id: 4,
    name: "Sneha Reddy",
    role: "QA Engineer",
    score: 90,
    productivity: 89,
    avatar: "S",
    badge: "Consistent",
    color: "var(--info)",
  },
];

const TopPerformers = () => {
  return (
    <Paper elevation={3} className="top-performers">
      <Stack
        direction="row"
        className="top-header"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" className="top-title">
          🏆 Top Performers
        </Typography>

        <TrendingUp color="success" />
      </Stack>

      <Stack spacing={2.5}>
        {performers.map((employee, index) => (
          <Box key={employee.id} className="performer-card">
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: "center" }}
              >
                <Typography className="performer-rank">
                  #{index + 1}
                </Typography>

                <Avatar
                  className="performer-avatar"
                  sx={{
                    bgcolor: employee.color,
                  }}
                >
                  {employee.avatar}
                </Avatar>

                <Box>
                  <Typography className="performer-name">
                    {employee.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {employee.role}
                  </Typography>
                </Box>
              </Stack>

              <EmojiEvents
                sx={{
                  color: employee.color,
                  fontSize: 28,
                }}
              />
            </Stack>

            <Stack
              direction="row"
              className="score-row"
              sx={{ justifyContent: "space-between" }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Performance Score
              </Typography>

              <Typography sx={{ fontWeight: 700 }}>
                {employee.score}%
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={employee.score}
              className="progress-bar"
            />

            <Stack
              direction="row"
              className="bottom-row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Productivity <strong>{employee.productivity}%</strong>
              </Typography>

              <Chip
                label={employee.badge}
                size="small"
                color="success"
              />
            </Stack>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default TopPerformers;