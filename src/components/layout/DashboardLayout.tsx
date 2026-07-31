import {
  Outlet,
} from "react-router-dom";

import Sidebar
  from "../Sidebar";

import Topbar
  from "../Topbar";

import"../PageState"
import"../ProtectedRoute"


import type {
  User,
} from "../../types/auth";

interface DashboardLayoutProps {
  user: User;
}

function DashboardLayout({
  user,
}: DashboardLayoutProps) {

  return (
    <div className="app-shell">

      <Sidebar
        user={user}
      />

      <div className="main-area">

        <Topbar
          user={user}
        />

        <main
          className="page-content"
          id="main-content"
        >
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;