import { useEffect, useState } from "react";
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
  CircularProgress,
} from "@mui/material";

import {
  AssignmentTurnedIn,
  EventAvailable,
  CheckCircle,
} from "@mui/icons-material";

import leaveApi, { LeaveRequestData } from "../../services/leaveApi";
import "./ActivityFeed.css";

interface ActivityItem {
  id: string;
  name: string;
  action: string;
  time: string;
  avatar: string;
  status: string;
  color: "warning" | "success" | "info";
  icon: React.ReactNode;
}

const ActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchActivities = async () => {
      try {
        const leaves = await leaveApi.getLeaves();
        if (!isMounted || !Array.isArray(leaves)) return;

        const items: ActivityItem[] = leaves.slice(0, 5).map((l: LeaveRequestData, idx) => {
          const emp = l.employeeId;
          const name = emp ? `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.employeeId || "Employee" : "Team Member";
          const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "T";
          const statusColor = l.status === "Approved" ? ("success" as const) : l.status === "Pending" ? ("warning" as const) : ("info" as const);
          const dateStr = l.createdAt ? new Date(l.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Recent";
          const icon = l.status === "Approved" ? <CheckCircle fontSize="small" color="success" /> : l.status === "Pending" ? <AssignmentTurnedIn fontSize="small" color="warning" /> : <EventAvailable fontSize="small" color="info" />;

          return {
            id: l._id || String(idx),
            name,
            action: `${l.status === "Approved" ? "Approved" : "Submitted"} ${l.type} leave for ${l.startDate}`,
            time: dateStr,
            avatar: initials,
            status: l.status || "Leave",
            color: statusColor,
            icon,
          };
        });

        setActivities(items);
      } catch (err) {
        console.error("Failed to load real team activities:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchActivities();
    return () => {
      isMounted = false;
    };
  }, []);
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

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      ) : activities.length === 0 ? (
        <Box sx={{ py: 3, textAlign: "center", color: "var(--text-light)" }}>
          <Typography variant="body2">No recent team activities recorded.</Typography>
        </Box>
      ) : (
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
      )}
    </Paper>
  );
};

export default ActivityFeed;