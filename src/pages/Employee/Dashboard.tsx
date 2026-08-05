import { Box } from "@mui/material";
import DashboardAnalytics from "../../features/dashboard/components/DashboardAnalytics/DashboardAnalytics";
import TimeClock from "../../components/attendance/TimeClock";
import { employees } from "../../data/employees";

const EmployeeDashboard = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh" }}>
      {/* Check-In/Check-Out Widget at the top of the dashboard */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <TimeClock />
      </Box>

      {/* Render the DashboardAnalytics view for the employee */}
      <DashboardAnalytics employees={employees} />
    </Box>
  );
};

export default EmployeeDashboard;
