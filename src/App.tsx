import DashboardPage from "./features/dashboard/pages/DashboardPage";

function App() {
  return <DashboardPage />;
}

export default App;
import AppRoutes from "./routes/AppRoutes";
import EmployeeTable from './components/EmployeeTable';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Workforce Analytics Dashboard</h1>
      <EmployeeTable />
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Workforce from "./pages/Workforce";
import Employees from "./pages/Employees";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import "./App.css";

type Role =
  | "admin"
  | "hr"
  | "manager"
  | "employee";

type User = {
  name: string;
  role: Role;
};

/* =========================================
   CURRENT USER
   Change role to test RBAC

const currentUser: User = {
  name: "John Smith",
  role: "admin",
};


/* =========================================
   NAVIGATION ITEMS

type NavigationItem = {
  label: string;
  path: string;
  icon: string;
  roles: Role[];
};

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "▦",
    roles: [
      "admin",
      "hr",
      "manager",
      "employee",
    ],
  },
  {
    label: "Workforce",
    path: "/workforce",
    icon: "◈",
    roles: [
      "admin",
      "hr",
      "manager",
    ],
  },
  {
    label: "Employees",
    path: "/employees",
    icon: "♙",
    roles: [
      "admin",
      "hr",
      "manager",
    ],
  },
  {
    label: "Reports",
    path: "/reports",
    icon: "▥",
    roles: [
      "admin",
      "hr",
      "manager",
    ],
  },
  {
    label: "Settings",
    path: "/settings",
    icon: "⚙",
    roles: ["admin"],
  },
];


/* =========================================
   ROLE CHECK

function hasAccess(
  allowedRoles: Role[],
  role: Role,
) {
  return allowedRoles.includes(role);
}


/* =========================================
   PROTECTED ROUTE

type ProtectedRouteProps = {
  allowedRoles: Role[];
};

function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const location = useLocation();

  if (
    !hasAccess(
      allowedRoles,
      currentUser.role,
    )
  ) {
    return (
      <div className="page-state error">
        <h3>Access Denied</h3>

        <p>
          You do not have permission to
          access this page.
        </p>

        <p>
          Current role:{" "}
          <strong>
            {currentUser.role}
          </strong>
        </p>

        <NavLink
          to="/dashboard"
          className="nav-item"
        >
          Go to Dashboard
        </NavLink>
      </div>
    );
  }

  return <Outlet />;
}


/* =========================================
   APP LAYOUT

function AppLayout() {
  const visibleNavigation =
    navigationItems.filter((item) =>
      hasAccess(
        item.roles,
        currentUser.role,
      ),
    );

  return (
    <div className="app-shell">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="logo">
          Workforce
        </div>

        <nav
          className="sidebar-nav"
          aria-label="Main navigation"
        >
          {visibleNavigation.map(
            (item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive
                    ? "nav-item active"
                    : "nav-item"
                }
              >
                <span
                  aria-hidden="true"
                >
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>
              </NavLink>
            ),
          )}
        </nav>

      </aside>


      {/* MAIN AREA */}

      <div className="main-area">

        {/* TOPBAR */}

        <header className="topbar">

          <strong>
            Workforce Analytics
          </strong>

          <div className="user-info">

            <span>
              {currentUser.name}
            </span>

            <span className="role-badge">
              {currentUser.role}
            </span>

          </div>

        </header>


        {/* PAGE CONTENT */}

        <main className="page-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}


/* =========================================
   404 PAGE

function NotFound() {
  return (
    <div className="page-state">

      <h3>
        Page Not Found
      </h3>

      <p>
        The page you are looking for
        does not exist.
      </p>

      <NavLink
        to="/dashboard"
        className="nav-item"
      >
        Go to Dashboard
      </NavLink>

    </div>
  );
}


/* =========================================
   APP

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* MAIN APPLICATION */}

        <Route
          element={<AppLayout />}
        >

          {/* DEFAULT REDIRECT */}

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />


          {/* DASHBOARD */}

          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "admin",
                  "hr",
                  "manager",
                  "employee",
                ]}
              />
            }
          >
            <Route
              path="/dashboard"
              element={
                <Dashboard />
              }
            />
          </Route>


          {/* WORKFORCE */}

          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "admin",
                  "hr",
                  "manager",
                ]}
              />
            }
          >
            <Route
              path="/workforce"
              element={
                <Workforce />
              }
            />
          </Route>


          {/* EMPLOYEES */}

          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "admin",
                  "hr",
                  "manager",
                ]}
              />
            }
          >
            <Route
              path="/employees"
              element={
                <Employees />
              }
            />
          </Route>


          {/* REPORTS */}

          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "admin",
                  "hr",
                  "manager",
                ]}
              />
            }
          >
            <Route
              path="/reports"
              element={
                <Reports />
              }
            />
          </Route>


          {/* SETTINGS */}

          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "admin",
                ]}
              />
            }
          >
            <Route
              path="/settings"
              element={
                <Settings />
              }
            />
          </Route>


          {/* 404 */}

          <Route
            path="*"
            element={
              <NotFound />
            }
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;
import React from "react";

function App() {
  return <AppRoutes />;
}

export default App;
export default App;
export default App;
