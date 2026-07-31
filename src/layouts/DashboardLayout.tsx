import { Outlet, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { useAppSelector } from "../hooks/redux";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import Breadcrumbs from "../components/layout/Breadcrumbs";

import "./DashboardLayout.css";

const DashboardLayout = () => {
  const { isAuthenticated, user } = useAppSelector(
    (state) => state.auth
  );

  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= 768
  );

  const [sidebarOpen, setSidebarOpen] = useState(
    window.innerWidth > 768
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;

      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
        user={user}
      />

      <div
        className={`dashboard-content ${
          sidebarOpen ? "" : "expanded"
        }`}
      >
        <Header
          toggleSidebar={toggleSidebar}
          user={user}
        />

        <div className="dashboard-body">
          <Breadcrumbs />

          <main className="dashboard-main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;