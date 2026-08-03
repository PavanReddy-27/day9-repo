// ====================================
// File: src/pages/NotFound/NotFound.tsx
// ====================================

import {
  Box,
  Button,
  Paper,
  Typography,
} from "@mui/material";

import ReportProblemIcon from "@mui/icons-material/ReportProblem";

import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "var(--bg)",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 550,
          width: "100%",
          p: 5,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <ReportProblemIcon
          color="primary"
          sx={{
            fontSize: 80,
            mb: 2,
          }}
        />

        <Typography
          variant="h2"
          sx={{ fontWeight: 700, color: "primary.main" }}
        >
          404
        </Typography>

        <Typography
          variant="h5"
          sx={{ fontWeight: 600, mb: 1 }}
        >
          Page Not Found
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mb: 4,
          }}
        >
          The page you are looking for doesn't
          exist or has been moved.
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/")}
        >
          Back to Home
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound;