import { Box } from "@mui/material";
import DashboardAnalytics from "../../features/dashboard/components/DashboardAnalytics/DashboardAnalytics";
import { employees } from "../../data/employees";

const EmployeeDashboard = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh" }}>
      {/* Render the DashboardAnalytics view for the employee */}
      <DashboardAnalytics employees={employees} />
    </Box>
  );
};

export default EmployeeDashboard;
