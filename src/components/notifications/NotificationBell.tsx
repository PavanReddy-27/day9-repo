import { useState, useEffect } from "react";
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  useTheme,
} from "@mui/material";
import { Notifications as NotificationsIcon, CheckCircleOutlined as CheckCircleOutlineIcon } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchNotifications, markAsRead, markAllAsRead } from "../../redux/notificationSlice";

const NotificationBell = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector((state) => state.notifications);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    dispatch(fetchNotifications());

    const handleNotificationUpdate = () => {
      dispatch(fetchNotifications());
    };

    window.addEventListener("notification_updated", handleNotificationUpdate);
    return () => {
      window.removeEventListener("notification_updated", handleNotificationUpdate);
    };
  }, [dispatch]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const open = Boolean(anchorEl);
  const id = open ? "notification-popover" : undefined;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SUCCESS": return theme.palette.success.main;
      case "WARNING": return theme.palette.warning.main;
      case "ALERT": return theme.palette.error.main;
      default: return theme.palette.info.main;
    }
  };

  return (
    <>
      <IconButton onClick={handleClick} size="large" sx={{ color: "var(--text-light)" }}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          "& .MuiPopover-paper": {
            width: 360,
            maxHeight: 500,
            borderRadius: 2,
            mt: 1.5,
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          }
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, pb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-h)" }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead} sx={{ fontSize: "0.75rem", textTransform: "none" }}>
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />
        <List sx={{ p: 0, overflow: "auto", maxHeight: 400 }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary" variant="body2">
                You have no notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <ListItem
                key={notification._id}
                sx={{
                  bgcolor: notification.isRead ? "transparent" : "var(--bg-hover)",
                  borderBottom: "1px solid var(--border)",
                  py: 1.5,
                  px: 2,
                  display: "flex",
                  alignItems: "flex-start",
                  transition: "background-color 0.2s",
                  "&:hover": { bgcolor: "var(--bg-hover)" },
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: notification.isRead ? "transparent" : getTypeColor(notification.type),
                    mt: 1,
                    mr: 2,
                    flexShrink: 0,
                  }}
                />
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 400 : 600, color: "var(--text-h)", mb: 0.5 }}>
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" sx={{ color: "var(--text-main)", mb: 0.5, lineHeight: 1.4 }}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "var(--text-light)" }}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </Typography>
                    </>
                  }
                  disableTypography
                />
                {!notification.isRead && (
                  <IconButton size="small" onClick={() => handleMarkAsRead(notification._id)} sx={{ alignSelf: "center", ml: 1 }}>
                    <CheckCircleOutlineIcon fontSize="small" color="action" />
                  </IconButton>
                )}
              </ListItem>
            ))
          )}
        </List>
      </Popover>
    </>
  );
};

export default NotificationBell;
