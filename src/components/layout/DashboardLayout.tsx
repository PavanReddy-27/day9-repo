import {
  Outlet,
} from "react-router-dom";
import { useSelector } from "react-redux";

import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import type { RootState } from "../../redux/store";

function DashboardLayout() {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) {
    return null;
  }

  const dashboardUser = {
    id: user.id,
    employeeId: user.employeeId,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    role: user.role,
    department: user.department,
    designation: user.designation,
    location: user.location,
    avatar: user.avatar,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return (
    <div className="app-shell">
      <Sidebar user={dashboardUser} />

      <div className="main-area">
        <Topbar user={dashboardUser} />

        <main className="page-content" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;