import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardAnalytics from "../components/DashboardAnalytics";
import EmployeeTable from "../../../components/EmployeeTable";
import { fetchEmployees, selectRestrictedDashboardEmployees } from "../../../redux/dashboardSlice";
import type { AppDispatch } from "../../../redux/store";

const DashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const employees = useSelector(selectRestrictedDashboardEmployees);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  return (
    <div
      style={{
        padding: "24px 0",
        background: "var(--bg)",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <DashboardAnalytics employees={employees} />
      <EmployeeTable />
    </div>
  );
};

export default DashboardPage;