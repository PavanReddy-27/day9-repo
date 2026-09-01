import { Box } from "@mui/material";
import EmployeeDashboardAnalytics from "../../features/dashboard/components/EmployeeDashboardAnalytics/EmployeeDashboardAnalytics";

const EmployeeDashboard = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh" }}>
      {/* Render the new personalized Employee dashboard analytics view */}
      <EmployeeDashboardAnalytics />
    </Box>
  );
};

export default EmployeeDashboard;
