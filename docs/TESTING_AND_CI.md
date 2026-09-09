# Testing and CI

## Local checks

Install dependencies once:

```bash
npm install
```

Run the checks used by CI:

```bash
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

Run the browser suite:

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright starts both services automatically. The Express API listens on port `5000`, and Vite listens on port `5173`. When a local API or Vite process is already running, Playwright reuses it.

The backend can use the in-memory MongoDB fallback when a local MongoDB instance is unavailable. This makes E2E data disposable; use a configured `MONGODB_URI` when you need persistence.

## E2E coverage

`tests/e2e/role-access.spec.ts` verifies:

- Admin, HR, Manager, and Employee credentials reach the correct protected dashboard.
- The authenticated role is rendered in the application shell.
- An unauthenticated visitor is redirected away from a protected route.

`tests/e2e/attendance-flow.spec.ts` covers the employee login entry point for the attendance workflow. The repository currently defines four authenticated roles. A fifth role is mentioned in older project notes but is not present in `src/types/auth.ts`, the route guards, or the seed accounts, so it is not represented as a false-positive E2E case.

The Playwright project runs Chromium desktop and Mobile Chrome. On CI, failures retain the HTML report as the `playwright-report` artifact.

## GitHub Actions

`.github/workflows/quality.yml` runs on pushes to `main` and on pull requests. It performs, in order:

1. `npm ci`
2. Playwright Chromium installation
3. ESLint
4. TypeScript type-checking for the frontend and server
5. Vitest unit and integration tests
6. The production Vite build
7. Playwright E2E tests

The workflow cancels superseded runs for the same ref and uploads the Playwright report even when a test fails.
