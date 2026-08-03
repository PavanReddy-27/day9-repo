import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Typography,
} from "@mui/material";

import {
  Groups,
  EventAvailable,
  AssignmentTurnedIn,
  TrendingUp,
  WarningAmber,
  EmojiEvents,
} from "@mui/icons-material";

import "./ManagerKPICards.css";

const kpiData = [
  {
    title: "Team Members",
    value: "48",
    progress: 100,
    trend: "+2",
    color: "var(--primary)",
    icon: <Groups fontSize="large" />,
  },
  {
    title: "Present Today",
    value: "44",
    progress: 92,
    trend: "+4%",
    color: "var(--success)",
    icon: <EventAvailable fontSize="large" />,
  },
  {
    title: "Pending Leaves",
    value: "5",
    progress: 35,
    trend: "-1",
    color: "var(--warning)",
    icon: <AssignmentTurnedIn fontSize="large" />,
  },
  {
    title: "Performance",
    value: "92%",
    progress: 92,
    trend: "+8%",
    color: "var(--info)",
    icon: <TrendingUp fontSize="large" />,
  },
  {
    title: "High Risk",
    value: "3",
    progress: 18,
    trend: "-2",
    color: "var(--error)",
    icon: <WarningAmber fontSize="large" />,
  },
  {
    title: "Goals Achieved",
    value: "88%",
    progress: 88,
    trend: "+6%",
    color: "var(--secondary)",
    icon: <EmojiEvents fontSize="large" />,
  },
];

const ManagerKPICards = () => {
  return (
    <Box className="manager-kpi-grid">
      {kpiData.map((item) => (
        <Card
          key={item.title}
          elevation={3}
          className="manager-kpi-card"
        >
          <CardContent>
            <Box
              className="manager-kpi-icon"
              sx={{ backgroundColor: item.color }}
            >
              {item.icon}
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {item.title}
            </Typography>

            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mt: 1 }}
            >
              {item.value}
            </Typography>

            <Chip
              label={item.trend}
              color={
                item.trend.startsWith("-")
                  ? "error"
                  : "success"
              }
              size="small"
              className="manager-kpi-chip"
            />

            <LinearProgress
              variant="determinate"
              value={item.progress}
              className="manager-kpi-progress"
            />

            <Typography
              variant="caption"
              color="text.secondary"
              className="manager-kpi-text"
            >
              Progress: {item.progress}%
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default ManagerKPICards;