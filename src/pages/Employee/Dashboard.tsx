import { Box } from "@mui/material";
import EmployeeDashboardAnalytics from "../../features/dashboard/components/EmployeeDashboardAnalytics/EmployeeDashboardAnalytics";

const EmployeeDashboard = () => {
  return (
    <Box sx={{ width: "100%", margin: 0 }}>
      {/* Render the new personalized Employee dashboard analytics view */}
      <EmployeeDashboardAnalytics />
    </Box>
  );
};

export default EmployeeDashboard;
