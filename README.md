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

Start the API in a second terminal for authenticated features:

```bash
npm run server
```

### Build Project

```bash
npm run build
```

### Run Tests

```bash
npm test
npm run test:e2e
```

See [docs/TESTING_AND_CI.md](docs/TESTING_AND_CI.md) for the complete local test workflow, Playwright coverage, and GitHub Actions checks.

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
---

This project is intended for educational and organizational use.
## 🚢 Task 16: Production Deployment, Monitoring, Performance and Disaster Recovery

### 📌 Architecture & Subsystem Summary
- **Multi-Container Production Orchestration**: Fully containerized production stack using multi-stage Dockerfiles for backend (Node.js 20 Alpine, unprivileged `node` user) and frontend (Vite build + Nginx Alpine with gzip, security headers, reverse proxy), orchestrated via `docker-compose.yml`.
- **High-Availability Health Probes**: Native `/health` (liveness), `/ready` (readiness with MongoDB ping), and `/version` endpoints for Kubernetes/container health checks.
- **Enterprise Observability & Security**: Request correlation tracing via `X-Request-Id`, structured JSON logging with duration metrics, and automated recursive sensitive-data redaction for credentials, tokens, PII, and connection strings.
- **Admin System Health & Telemetry Dashboard**: Real-time glassmorphism/luxury-glow monitoring dashboard at `/admin/system-health` featuring memory utilization gauges, MongoDB latency monitors, traffic distribution, background job metrics, DLQ management, one-click backups, and retention triggers.
- **MongoDB Index & Query Optimization**: Automated compound and covered indexes (`npm run optimize:indexes`) ensuring sub-millisecond execution times and 0 COLLSCAN queries across all high-cardinality collections.
- **Reliable Background Queue & Dead-Letter Queue (DLQ)**: Asynchronous job queue featuring exponential backoff retries with full randomization jitter, permanent failure routing to `deadletterjobs`, and administrative manual re-drive controls.
- **Disaster Recovery & Backup Automation**: Cryptographically verified database backup snapshots (`npm run backup:db`) with SHA-256 manifests, and atomic restoration with strict data fidelity verification (`npm run restore:db`).
- **Data Retention & Compliance**: Policy engine for purging expired audit logs, notifications, and tokens with dry-run verification, alongside tamper-evident JSON audit log exports signed with SHA-256 checksums.

### 👥 Task Allocation & Ownership
- **Pavan Kumar**: Frontend performance optimization (chunk splitting < 1000 kB), Admin System Health dashboard (`/admin/system-health`), luxury glow UI integration, and navigation controls.
- **Sridhika**: MongoDB index optimization (`optimizeIndexes.ts`), query performance benchmarking (`benchmarkQueries.ts`), automated backup snapshots (`backup.ts`), and restoration runbooks (`restore.ts`).
- **Ravi Prasad**: Sensitive data scrubbing (`redact.ts`), structured logging, automated data retention rules (`retentionService.ts`), and cryptographic audit log exports (`exportService.ts`).
- **Rupesh**: Reliable background queue (`jobQueueService.ts`), exponential backoff retry policy, and Dead-Letter Queue management routes.
- **Suman**: Production health probes (`/health`, `/ready`, `/version`), request correlation (`X-Request-Id`), and system metrics telemetry.
- **Anvesh**: Production Dockerfiles, Docker Compose configuration, Nginx tuning, E2E test automation, and disaster recovery documentation.

---

## 🚀 Task 14: Production Database Integration & Workforce Analytics System
### 🐳 Production Deployment with Docker Compose

### 📌 Architecture & Subsystem Summary
- **Backend Framework**: Node.js & Express API server (`server/index.js`, `server/routes/api.js`).
- **Database**: MongoDB Mongoose with 22 collections, transactions, indexing, and multi-tenant `companyId` scoping.
- **Seeding Engine**: Deterministic seeder (`npm run seed`) creating 1 company, 5 locations (250 employees total: HYD 70, VSP 40, CHN 50, BLR 60, KOC 30), 7 departments, 5 dev role accounts (hashed with bcrypt), and 12 months of historical analytics.
- **Attendance State Machine & Transitions**: `Not Checked In` → `Working` → `On Break` → `Working` → `Checked Out`. Enforces valid transition paths and prevents double check-in/checkout.
- **Geofencing Engine**: Haversine formula calculation measuring actual user GPS coordinates against target office location (`distanceMeters <= geofenceRadiusMeters`). Strict validation for Office mode with WFH fallback support.
- **Shift & Overtime Calculations**: Supports `Regular` (9 AM - 5 PM), `Flexible` (0 late mins), `Night`, and `CrossMidnight` shift kinds. Calculates late minutes, early departure, and overtime minutes (`netWorkMinutes - 480`).
- **Attendance Corrections & Approvals**: Employee correction request workflow with `Pending`, `Approved`, `Rejected` states, manager approval history logging, and automatic record recalculation upon approval.
- **Server-Side Audit Logs**: Automatic write-through audit logging for sensitive actions (`ATTENDANCE_CHECK_IN`, `ATTENDANCE_BREAK_START`, `ATTENDANCE_WORK_RESUME`, `ATTENDANCE_CHECK_OUT`, `ATTENDANCE_CORRECTION_REQUESTED`, `APPROVED_ATTENDANCE_CORRECTION`, `REJECTED_ATTENDANCE_CORRECTION`).
- **Role-Based Access Control**: 5 Role Dashboards (Admin, HR, Manager, Team Lead, Employee) with strict backend data scoping.
```bash
# Build and launch complete production stack (MongoDB + API Backend + Nginx Frontend)
docker compose up --build -d

### 🔑 Test Dev Accounts
- **Admin**: `admin@company.com` / `admin123`
- **HR**: `hr@company.com` / `hr123`
- **Manager**: `manager@company.com` / `manager123`
- **Team Lead**: `teamlead@company.com` / `teamlead123`
- **Employee**: `employee@company.com` / `employee123`
# Verify container health
docker compose ps

### 🛠️ Execution & Validation Commands
# Inspect backend and frontend logs
docker compose logs -f api
docker compose logs -f frontend

**1. Environment Configuration**
Ensure your `.env` contains the required variables (see `.env.example`):
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_COMPANY_NAME=Stackly
MONGODB_URI=mongodb://127.0.0.1:27017/workforce_analytics
JWT_SECRET=supersecret_jwt_access_key_change_in_production_32char
DEFAULT_GEOFENCE_RADIUS=500
# Gracefully tear down
docker compose down
```

**2. Database Seeding**
---

### 🛡️ Disaster Recovery & Maintenance Commands

```bash
npm run seed
```
# 1. Optimize and verify all database compound indexes
npm run optimize:indexes

**3. Run Quality & Test Validation Checks**
All checks pass with zero errors:
```bash
npm run lint          # ESLint check (0 errors, 0 warnings)
npm run typecheck     # TypeScript check (tsc --noEmit)
npx vitest run        # Full Vitest suite (8 test files, 33/33 tests passing)
npm run build         # Vite production build verification
# 2. Run query execution plan benchmarks
npm run benchmark:db

# 3. Create a cryptographically verified database snapshot
npm run backup:db

# 4. Restore database from latest (or target) snapshot
npm run restore:db
```

---

### ✅ Quality & Verification Results Matrix

All 5 quality and test commands pass with **zero errors**:

| Command | Target / Scope | Status | Result / Metric |
|---|---|---|---|
| `npm run lint` | ESLint across entire codebase | **PASS** | 0 errors, 0 warnings |
| `npm run typecheck` | TypeScript compiler (`tsc --noEmit`) | **PASS** | 0 errors across frontend & backend |
| `npm test` | Vitest Unit & Integration Suites | **PASS** | **16/16 suites passed** (85 passed, 4 skipped) |
| `npm run test:e2e` | Playwright End-to-End Suite | **PASS** | **18/18 tests passed** (Desktop & Mobile Chrome) |
| `npm run build` | Vite + TypeScript production build | **PASS** | All chunks < 1000 kB (Main chunk: 858 kB) |

---

### 📚 Task 16 Verification Evidence Documents
- [DOCKER_STARTUP.md](file:///c:/React/WorkForce-Analytics-Task8/docs/evidence/DOCKER_STARTUP.md): Docker Compose multi-container initialization and curl verification.
- [HEALTH_PROBES.md](file:///c:/React/WorkForce-Analytics-Task8/docs/evidence/HEALTH_PROBES.md): Liveness, readiness, version endpoints, and structured JSON logs.
- [QUERY_PERFORMANCE.md](file:///c:/React/WorkForce-Analytics-Task8/docs/evidence/QUERY_PERFORMANCE.md): Compound index coverage and query execution benchmark tables.
- [BACKGROUND_JOBS_RETRY.md](file:///c:/React/WorkForce-Analytics-Task8/docs/evidence/BACKGROUND_JOBS_RETRY.md): Exponential backoff math, retry timeline, and DLQ re-drive.
- [BACKUP_AND_RESTORE.md](file:///c:/React/WorkForce-Analytics-Task8/docs/evidence/BACKUP_AND_RESTORE.md): RTO/RPO targets, snapshot generation, and 100% data fidelity restoration.
- [SECURITY_AND_AUTHORIZATION.md](file:///c:/React/WorkForce-Analytics-Task8/docs/evidence/SECURITY_AND_AUTHORIZATION.md): Log redaction, data retention policies, and multi-tenant authorization suite.

---

## 📄 License

This project is intended for educational and organizational use.

---

## 🙏 Acknowledgements

Developed collaboratively by **Team 2** through coordinated planning, feature development, integration, testing, and quality review to deliver a scalable and production-ready Workforce Analytics Dashboard.

