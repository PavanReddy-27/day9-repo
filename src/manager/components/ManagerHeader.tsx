import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Avatar,
    IconButton,
    Badge,
    TextField,
    InputAdornment,
  } from "@mui/material";
  
  import {
    Notifications,
    Search,
  } from "@mui/icons-material";
  
  import "./ManagerHeader.css";
  
  const ManagerHeader = () => {
    return (
      <AppBar
        position="sticky"
        elevation={1}
        color="inherit"
        className="manager-header-appbar"
      >
        <Toolbar className="manager-header-toolbar">
          <Box className="manager-header-title">
            <Typography
              variant="h5"
              sx={{ fontWeight: 700 }}
            >
              Manager Dashboard
            </Typography>
  
            <Typography
              variant="body2"
              className="manager-header-subtitle"
            >
              Welcome back! Here's your team's overview.
            </Typography>
          </Box>
  
          <Box className="manager-header-spacer" />
  
          <TextField
            size="small"
            placeholder="Search..."
            className="manager-header-search"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
  
          <IconButton className="manager-header-icon">
            <Badge
              badgeContent={4}
              color="error"
            >
              <Notifications />
            </Badge>
          </IconButton>
  
          <Avatar className="manager-header-avatar">
            M
          </Avatar>
  
          <Box className="manager-header-profile">
            <Typography
              variant="body1"
              className="manager-header-profile-name"
            >
              Manager
            </Typography>
  
            <Typography
              variant="caption"
              className="manager-header-profile-role"
            >
              Manager
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
    );
  };
  
  export default ManagerHeader;



