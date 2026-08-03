import {
  Avatar,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";

import {
  AssignmentTurnedIn,
  EventAvailable,
  EmojiEvents,
  TrendingUp,
} from "@mui/icons-material";

import "./ActivityFeed.css";

const activities = [
  {
    id: 1,
    name: "Rahul Sharma",
    action: "Checked in successfully",
    time: "5 mins ago",
    avatar: "R",
    icon: <EventAvailable color="success" />,
    status: "Attendance",
    color: "success" as const,
  },
  {
    id: 2,
    name: "Priya Patel",
    action: "Submitted a leave request",
    time: "18 mins ago",
    avatar: "P",
    icon: <AssignmentTurnedIn color="warning" />,
    status: "Leave",
    color: "warning" as const,
  },
  {
    id: 3,
    name: "Anil Kumar",
    action: "Completed performance review",
    time: "1 hour ago",
    avatar: "A",
    icon: <TrendingUp color="primary" />,
    status: "Performance",
    color: "primary" as const,
  },
  {
    id: 4,
    name: "Sneha Reddy",
    action: "Received Employee of the Sprint",
    time: "Today",
    avatar: "S",
    icon: <EmojiEvents sx={{ color: "#F59E0B" }} />,
    status: "Achievement",
    color: "secondary" as const,
  },
];

const ActivityFeed = () => {
  return (
    <Paper elevation={3} className="activity-feed">
      <Typography
        variant="h6"
        sx={{ fontWeight: 700 }}
        gutterBottom
      >
        📢 Recent Team Activity
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        className="activity-subtitle"
      >
        Latest updates from your team members.
      </Typography>

      <List disablePadding>
        {activities.map((activity, index) => (
          <Box key={activity.id}>
            <ListItem className="activity-item">
              <ListItemAvatar>
                <Avatar className="activity-avatar">
                  {activity.avatar}
                </Avatar>
              </ListItemAvatar>

              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: 600 }}>
                    {activity.name}
                  </Typography>
                }
                slotProps={{
                  secondary: {
                    component: "div",
                  },
                }}
                secondary={
                  <Box>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      {activity.action}
                    </Typography>

                    <Typography
                      component="span"
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: "block" }}
                    >
                      {activity.time}
                    </Typography>
                  </Box>
                }
              />

              <Box className="activity-status">
                {activity.icon}

                <Chip
                  label={activity.status}
                  color={activity.color}
                  size="small"
                  className="activity-chip"
                />
              </Box>
            </ListItem>

            {index !== activities.length - 1 && (
              <Divider />
            )}
          </Box>
        ))}
      </List>
    </Paper>
  );
};

export default ActivityFeed;