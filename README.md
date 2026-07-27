# Workforce Analytics Dashboard

A modern, responsive **Workforce Analytics Dashboard** built with **React, TypeScript, Vite, Tailwind CSS, Redux Toolkit, and Recharts**. The dashboard provides real-time workforce insights through interactive KPI cards, analytics charts, employee management, filtering, and responsive visualizations for HR teams and business leaders.

---

## 📖 Project Overview

This project was developed as part of **Team 2's Recovery Sprint** to complete the pending Workforce Analytics Dashboard tasks. The objective was to integrate the strongest existing implementations into one production-ready application without restarting the project.

The dashboard uses a **shared typed employee dataset**, ensuring that KPIs, charts, filters, and employee records remain synchronized. Applying any filter updates the entire dashboard in real time.

---

# 🚀 Features

## Dashboard

- Responsive enterprise dashboard layout
- Responsive sidebar and header
- Breadcrumb navigation
- Modern card-based interface
- Light & Dark theme support
- Desktop, Tablet, and Mobile responsive

---

## KPI Cards

Eight reusable KPI cards displaying:

- Total Employees
- Active Employees
- New Hires
- Attrition Rate
- Average Salary
- Attendance Rate
- Employee Satisfaction
- Productivity Score

Each KPI includes:

- Trend indicators
- Percentage comparison
- Reusable card component
- Responsive layout

---

## Analytics

Interactive workforce analytics including:

- Workforce Trend Chart
- Department Distribution Chart
- Location Distribution Chart
- Role Distribution Chart
- Status Analytics
- Risk Analysis

---

## Filters

Dashboard-wide filters using a shared employee dataset:

- Department
- Role
- Location
- Employment Status
- Risk Level
- Date Range

All filters automatically update:

- KPI Cards
- Charts
- Employee Table
- Drill-down Views

---

## Employee Management

- Search Employees
- Sort Employee Records
- Responsive Employee Table
- Shared typed dataset
- Dynamic filtering

---

## KPI Drill-Down

- Detailed KPI modal/panel
- Department-wise insights
- Employee breakdown
- Interactive statistics

---

## Application States

- Loading State
- Empty State
- Error State
- Responsive layouts
- Theme switching

---

# 🛠 Technology Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| State Management | Redux Toolkit |
| Routing | React Router DOM |
| Charts | Recharts |
| Forms | React Hook Form |
| Validation | Zod |
| Icons | React Icons |
| CSV Export | PapaParse |
| Testing | Vitest & React Testing Library |

---

# 📂 Project Structure

```
src/
│
├── assets/
├── components/
│   ├── dashboard/
│   ├── charts/
│   ├── filters/
│   ├── table/
│   ├── sidebar/
│   ├── header/
│   └── common/
│
├── layouts/
├── pages/
├── routes/
├── services/
├── store/
├── hooks/
├── utils/
├── types/
├── data/
│
├── App.tsx
├── main.tsx
└── index.css
```

---

# ▶️ Getting Started

## Clone Repository

```bash
git clone https://github.com/<your-username>/WorkForce-Analytics-Dashboard.git
cd WorkForce-Analytics-Dashboard
```

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Run Tests

```bash
npm test
```

---

# 📊 Dashboard Modules

- Workforce Overview
- KPI Dashboard
- Employee Directory
- Workforce Trends
- Department Analytics
- Location Analytics
- Role Analytics
- Risk Analysis
- Employee Search & Filters
- CSV Export

---

# 📌 Recovery Sprint Objectives

The project focused on completing the pending dashboard requirements by integrating the strongest existing implementations into a unified application.

### Completed Deliverables

- Responsive Sidebar
- Responsive Header
- Breadcrumb Navigation
- Eight Reusable KPI Cards
- KPI Trend Indicators
- Workforce Trend Chart
- Department Distribution Chart
- Role, Location, Status & Risk Charts
- Dashboard-wide Filters
- Searchable Employee Table
- Sortable Employee Table
- KPI Drill-Down Panel
- CSV Export
- Loading, Empty & Error States
- Light & Dark Themes
- Responsive Design
- Shared Typed Employee Dataset

---

# 👥 Team Contributions

The Workforce Analytics Dashboard was developed collaboratively by **Team 2**.

| Team Member | Contribution |
|------------|--------------|
| **Maheswari (Team Lead)** | Project coordination, KPI review, feature integration, code review, blocker management, final dashboard integration |
| **Sridhika** | Dashboard UI, responsive layouts, reusable dashboard components |
| **Pavan Kumar** | Analytics charts, KPI calculations, KPI drill-down implementation |
| **Ravi Prasad** | Dashboard filters, employee table, sorting, searching, CSV export |
| **Anvesh** | Application integration, testing, bug fixes, quality assurance, final validation |

> The application was built by integrating the strongest implementations from different contributors into a single cohesive dashboard, preserving reusable components and avoiding unnecessary redevelopment.

---

# 🤝 Contributing

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature-name
```

3. Commit your changes.

```bash
git commit -m "feat: add new dashboard feature"
```

4. Push your branch.

```bash
git push origin feature/your-feature-name
```

5. Open a Pull Request for review.

---

# 📄 License

This project is intended for educational and organizational use.

---

# ⭐ Acknowledgements

Special thanks to all Team 2 members for their collaborative effort in delivering a responsive, reusable, and scalable Workforce Analytics Dashboard through coordinated development and successful feature integration.
