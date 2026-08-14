# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
# Workforce Analytics Dashboard

A modern and responsive **Workforce Analytics Dashboard** built using **React, TypeScript, Vite, Tailwind CSS, Redux Toolkit, and Recharts**. The application provides HR teams and business leaders with real-time workforce insights through interactive dashboards, KPI cards, employee analytics, and data visualizations.

---

## 📖 Project Overview

This project was developed collaboratively by **Team 2** to build an enterprise-level Workforce Analytics Dashboard. The application provides comprehensive workforce insights using a **shared typed employee dataset**, ensuring that all KPI cards, charts, filters, and employee records remain synchronized.

The dashboard follows a modular architecture with reusable components, responsive layouts, and modern UI practices.

---

## ✨ Features

### Dashboard
- Responsive Sidebar
- Responsive Header
- Breadcrumb Navigation
- Enterprise Dashboard Layout
- Light & Dark Theme Support
- Desktop, Tablet & Mobile Responsive

### KPI Cards
- Eight reusable KPI cards
- KPI trend indicators
- Percentage comparison
- Interactive KPI drill-down panel

### Analytics
- Workforce Trend Chart
- Department Distribution Chart
- Location Distribution Chart
- Role Distribution Chart
- Employee Status Analysis
- Risk Analysis Dashboard

### Employee Management
- Searchable Employee Table
- Sortable Employee Records
- Department, Role, Location, Status, Risk & Date Filters
- CSV Export

### Application
- Authentication
- Protected Routes
- Role-Based Access Control (RBAC)
- Navigation Management
- Loading State
- Empty State
- Error State

---

## 🛠️ Technology Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Redux Toolkit
- React Hook Form
- Zod
- Recharts
- React Icons
- PapaParse
- Vitest
- React Testing Library

---

## 📂 Project Structure

```
src/
│
├── assets/
├── components/
│   ├── charts/
│   ├── dashboard/
│   ├── filters/
│   ├── header/
│   ├── sidebar/
│   ├── table/
│   └── common/
│
├── layouts/
├── pages/
├── routes/
├── services/
├── store/
├── hooks/
├── types/
├── utils/
├── data/
│
├── App.tsx
├── main.tsx
└── index.css
```

---

## 🚀 Getting Started

### Clone the Repository

```bash
git clone https://github.com/<your-username>/WorkForce-Analytics-Dashboard.git
cd WorkForce-Analytics-Dashboard
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Build Project

```bash
npm run build
```

### Run Tests

```bash
npm test
```

---

## 📋 Core Modules

- Workforce Overview
- KPI Dashboard
- Employee Directory
- Workforce Trends
- Department Analytics
- Location Analytics
- Role Analytics
- Employee Search & Filters
- CSV Export
- Authentication & Routing

---


## 📌 Project Highlights

- Responsive enterprise dashboard
- Shared typed employee dataset
- Reusable React components
- Interactive charts and analytics
- Dashboard-wide filtering
- KPI drill-down functionality
- CSV export support
- Authentication & RBAC
- Responsive design for desktop, tablet, and mobile
- Unit testing and quality assurance

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature-name
```

3. Commit your changes.

```bash
git commit -m "feat: add new feature"
```

4. Push the branch.

```bash
git push origin feature/your-feature-name
```

5. Open a Pull Request for review.

---

## 📄 License

This project is intended for educational and organizational use.

---

## 🚀 Task 14: Production Database Integration & Workforce Analytics System

### 📌 Architecture Summary
- **Backend Framework**: Node.js & Express API server (`server/index.js`, `server/routes/api.js`).
- **Database**: MongoDB Mongoose with 22 collections, transactions, indexing, and multi-tenant `companyId` scoping.
- **Seeding Engine**: Deterministic seeder (`npm run seed`) creating 1 company, 5 locations (250 employees total: HYD 70, VSP 40, CHN 50, BLR 60, KOC 30), 7 departments, 5 dev role accounts (hashed with bcrypt), and 12 months of historical analytics.
- **Attendance State Machine**: Not Checked In → Working → On Break → Working → Checked Out with Haversine geofence validation and IndexedDB offline queue sync.
- **Role-Based Access Control**: 5 Role Dashboards (Admin, HR, Manager, Team Lead, Employee) with strict backend data scoping.

### 🔑 Test Dev Accounts
- **Admin**: `admin@company.com` / `admin123`
- **HR**: `hr@company.com` / `hr123`
- **Manager**: `manager@company.com` / `manager123`
- **Team Lead**: `teamlead@company.com` / `teamlead123`
- **Employee**: `employee@company.com` / `employee123`

### 🛠️ Execution & Validation Commands

**1. MongoDB Setup & Environment Configuration**
The application requires a secure MongoDB connection via Mongoose. Ensure your `.env` contains the secure URI. **Do not use in-memory mock storage or SQLite**.
```env
# .env file
VITE_API_BASE_URL=http://localhost:5000/api/v1
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/workforce?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret
```

**2. Database Seeding**
The backend uses a strictly validated deterministic seeder that generates exactly 250 Stackly employees across 5 locations with no duplicate IDs:
- Hyderabad: 70
- Visakhapatnam: 40
- Chennai: 50
- Bengaluru: 60
- Kochi: 30
```bash
npm run seed
```

**3. Run Validation Checks**
To ensure codebase stability, all checks must pass before pushing to production:
```bash
npm run lint
npm run typecheck
npm run build
npm test -- --run
npx playwright test
```

---

## 🙏 Acknowledgements

Developed collaboratively by **Team 2** through coordinated planning, feature development, integration, testing, and quality review to deliver a scalable and production-ready Workforce Analytics Dashboard.
