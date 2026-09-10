import { Box } from "@mui/material";
import EmployeeDashboardAnalytics from "../../features/dashboard/components/EmployeeDashboardAnalytics/EmployeeDashboardAnalytics";

const EmployeeDashboard = () => {
  return (
    <Box sx={{ maxWidth: "1440px", margin: "0 auto" }}>
      {/* Render the new personalized Employee dashboard analytics view */}
      <EmployeeDashboardAnalytics />
    </Box>
  );
};

export default EmployeeDashboard;
