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
    id: String(user.id),
    name: user.username,
    role: user.role,
  };

  return (
    <div className="app-shell">
      <Sidebar />

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