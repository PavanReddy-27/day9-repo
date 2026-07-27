import DashboardAnalytics from "../components/DashboardAnalytics";
import { employees } from "../../../data/employees";

const DashboardPage = () => {
  return (
    <div
      style={{
        padding: "24px",
        background: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      <DashboardAnalytics employees={employees} />
    </div>
  );
};

export default DashboardPage;