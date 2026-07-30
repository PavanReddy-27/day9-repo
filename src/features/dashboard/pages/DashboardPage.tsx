import DashboardAnalytics from "../components/DashboardAnalytics";
import { employees } from "../../../data/employees";
import EmployeeTable from "../../../components/EmployeeTable";

const DashboardPage = () => {
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