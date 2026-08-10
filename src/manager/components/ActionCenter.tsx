import {
  Paper,
  Typography,
  Button,
  Stack,
  Box,
  Divider,
  Chip,
} from "@mui/material";

import {
  AssignmentTurnedIn,
  Event,
  Assessment,
  EmojiEvents,
  ArrowForward,
} from "@mui/icons-material";

import "./ActionCenter.css";

const actions = [
  {
    title: "Approve Leave Requests",
    description: "5 leave requests are waiting for approval.",
    icon: <AssignmentTurnedIn color="warning" />,
    chip: "High Priority",
    chipColor: "warning" as const,
  },
  {
    title: "Schedule Team Meeting",
    description: "Sprint planning meeting is scheduled this week.",
    icon: <Event color="primary" />,
    chip: "Upcoming",
    chipColor: "primary" as const,
  },
  {
    title: "Review Performance",
    description: "3 employee performance reviews are pending.",
    icon: <Assessment color="success" />,
    chip: "Pending",
    chipColor: "success" as const,
  },
  {
    title: "Recognize Top Performer",
    description: "Reward outstanding team members this month.",
    icon: <EmojiEvents sx={{ color: "#F59E0B" }} />,
    chip: "Monthly",
    chipColor: "secondary" as const,
  },
];

const ActionCenter = () => {
  return (
    <Paper elevation={3} className="action-center-card">
      <Typography
        variant="h6"
        className="action-center-title"
        gutterBottom
      >
        ⚡ Action Center
      </Typography>

      <Typography
        variant="body2"
        className="action-center-subtitle"
      >
        Review and complete your team's important tasks.
      </Typography>

      <Stack className="action-center-list">
        {actions.map((action, index) => (
          <Box key={index} className="action-item">
            <Stack
              direction="row"
              spacing={2}
              className="action-item-header"
            >
              <Stack
                direction="row"
                spacing={2}
                className="action-item-icon-group"
              >
                <Box className="action-item-icon">
                  {action.icon}
                </Box>

                <Box className="action-item-info">
                  <Typography
                    variant="subtitle1"
                    className="action-item-title"
                  >
                    {action.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    className="action-item-desc"
                  >
                    {action.description}
                  </Typography>
                </Box>
              </Stack>

              <Chip
                label={action.chip}
                color={action.chipColor}
                size="small"
                className="action-item-chip"
              />
            </Stack>

            <Button
              size="small"
              endIcon={<ArrowForward />}
              className="action-item-button"
            >
              View Details
            </Button>

            {index !== actions.length - 1 && (
              <Divider className="action-item-divider" />
            )}
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default ActionCenter;

