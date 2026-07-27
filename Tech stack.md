# Enterprise Workforce Analytics Dashboard - Tech Stack Setup Guide

## 1. Verify Installation

Run the following commands to verify your development environment:

```bash
node -v
npm -v
git --version
code --version
```

---

# 2. Install Node.js (LTS)

## Download

- **Node.js LTS:** https://nodejs.org/

## Verify Installation

```bash
node -v
npm -v
```

---

# 3. Install Git

## Download

- **Git for Windows:** https://git-scm.com/downloads

## Verify Installation

```bash
git --version
```

---

# 4. Install Visual Studio Code

## Download

- **Visual Studio Code:** https://code.visualstudio.com/

## Verify Installation

```bash
code --version
```

If `code` is not recognized:

1. Open **VS Code**
2. Press **Ctrl + Shift + P**
3. Run:

```text
Shell Command: Install 'code' command in PATH
```

---

# 5. Create React + TypeScript + Vite Project

```bash
npm create vite@latest workforce-analytics-dashboard -- --template react-ts
```

Move into the project directory:

```bash
cd workforce-analytics-dashboard
```

---

# 6. Install Required Packages

## React Router

```bash
npm install react-router-dom
```

---

## Redux Toolkit

```bash
npm install @reduxjs/toolkit react-redux
```

---

## TanStack React Query

```bash
npm install @tanstack/react-query
```

---

## Axios

```bash
npm install axios
```

---

## Tailwind CSS

```bash
npm install tailwindcss @tailwindcss/vite
```

---

## Recharts

```bash
npm install recharts
```

---

## React Icons

```bash
npm install react-icons
```

---

## React Hook Form

```bash
npm install react-hook-form
```

---

## Zod Validation

```bash
npm install zod @hookform/resolvers
```

---

## TanStack React Table

```bash
npm install @tanstack/react-table
```

---

## CSV Export

```bash
npm install papaparse
```

---

## Date Handling

```bash
npm install date-fns
```

---

## Debounce

```bash
npm install lodash
npm install -D @types/lodash
```

---

## Theme Support

```bash
npm install next-themes
```

---

## Notifications

```bash
npm install react-hot-toast
```

---

## Loading Spinner

```bash
npm install react-loader-spinner
```

---

## Utility Classes

```bash
npm install clsx
```

---

## UUID

```bash
npm install uuid
npm install -D @types/uuid
```

---

## Environment Variables

```bash
npm install dotenv
```

---

# 7. Testing

## Vitest

```bash
npm install -D vitest
```

---

## React Testing Library

```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

---

## Mock Service Worker (MSW)

```bash
npm install -D msw
```

---

## jsdom

```bash
npm install -D jsdom
```

---

# 8. Linting

## ESLint

```bash
npm install -D eslint
```

---

## TypeScript ESLint

```bash
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

---

## React ESLint

```bash
npm install -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh
```

---

## Prettier

```bash
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

---

# 9. Git Hooks

## Install Husky & lint-staged

```bash
npm install -D husky lint-staged
```

Initialize Husky:

```bash
npx husky init
```

---

# 10. Install Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GitLens
- Auto Rename Tag
- Path Intellisense
- Error Lens
- Material Icon Theme
- Thunder Client
- GitHub Pull Requests and Issues

---

# 11. Run the Development Server

```bash
npm run dev
```

---

# 12. Build the Application

```bash
npm run build
```

---

# 13. Run Lint

```bash
npm run lint
```

---

# 14. Run Tests

Using npm:

```bash
npm test
```

Or using Vitest:

```bash
npm run test
```

---

# Final Technology Stack

| Category | Technology |
|-----------|------------|
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Routing | React Router DOM |
| State Management | Redux Toolkit |
| Server State | TanStack React Query |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Forms | React Hook Form |
| Validation | Zod |
| HTTP Client | Axios |
| Tables | TanStack React Table |
| CSV Export | PapaParse |
| Date Utilities | date-fns |
| Notifications | React Hot Toast |
| Icons | React Icons |
| Utilities | Lodash, clsx, uuid |
| Testing | Vitest, React Testing Library, MSW |
| Code Quality | ESLint, Prettier, Husky, lint-staged |

---

# Recommended Project Structure

```text
workforce-analytics-dashboard/
│
├── public/
├── src/
│   ├── app/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── pages/
│   ├── redux/
│   ├── routes/
│   ├── services/
│   ├── theme/
│   ├── types/
│   └── utils/
│
├── tests/
├── docs/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```
