import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@mui/material";
import DashboardAnalytics from "../../features/dashboard/components/DashboardAnalytics/DashboardAnalytics";
import { fetchEmployees, selectRestrictedDashboardEmployees } from "../../redux/dashboardSlice";
import type { AppDispatch } from "../../redux/store";

const EmployeeDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const employees = useSelector(selectRestrictedDashboardEmployees);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh" }}>
      {/* Render the DashboardAnalytics view for the employee */}
      <DashboardAnalytics employees={employees} />
    </Box>
  );
};

export default EmployeeDashboard;
