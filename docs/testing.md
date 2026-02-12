# Testing

## Cloud Functions — Unit Tests

Unit tests live in `functions/__tests__/` and use Vitest + Supertest. Firestore and Storage are fully mocked — no network calls.

```bash
cd functions && npm test
```

- Config: `functions/vitest.config.ts`
- Setup: `functions/__tests__/setup.ts` (mocks `../src/lib/admin`)
- Mock helpers: `functions/__tests__/helpers/` (mock-firestore, mock-storage, fixtures, test-utils)
- Test files: `functions/__tests__/*.test.ts` (health, research, sources, files, intelligence, auth-keys, auth-middleware)

## Cloud Functions — Integration Tests

Integration tests hit the **deployed staging Cloud Functions** via real HTTP requests. They prove the full stack works: real Firestore reads/writes, real Storage uploads, real SHA-256 API key auth.

```bash
cd functions && npm run test:integration
```

- Config: `functions/vitest.integration.config.ts` (30s test timeout, 60s hook timeout)
- Staging URL: `https://europe-west1-marketintelligence-hub-staging.cloudfunctions.net/api`

### How It Works

1. **Global setup** (`__tests__/integration/setup.ts`): initializes Firebase Admin SDK with staging service account, seeds 3 API keys (admin/read_write/read) and a test research document, writes state to `.test-state.json`
2. **Tests** use `apiFetch()` helper from `__tests__/integration/helpers.ts` to make authenticated requests
3. **Global teardown** (`__tests__/integration/teardown.ts`): deletes all test data (identified by `_test_` prefix), seeded keys, audit logs, and Storage files

### Directory Structure

```
functions/__tests__/integration/
├── setup.ts                           # Seed staging Firestore
├── teardown.ts                        # Clean up all test data
├── helpers.ts                         # apiFetch wrapper, data factories, state management
├── health.integration.test.ts         # 2 tests — health endpoint
├── research.integration.test.ts       # 10 tests — CRUD + permission enforcement
├── sources.integration.test.ts        # 6 tests — add/validate sources, tier adjustment
├── files.integration.test.ts          # 5 tests — upload, list, magic byte rejection
├── intelligence.integration.test.ts   # 5 tests — competitors/landscape/summary
└── auth-keys.integration.test.ts      # 7 tests — create/use/list/revoke lifecycle
```

### Environment Variables

```bash
# Path to staging service account key (local dev)
STAGING_SERVICE_ACCOUNT_KEY=./marketintelligence-hub-staging-sa-key.json

# Or base64-encoded key (CI)
STAGING_SERVICE_ACCOUNT_KEY_BASE64=<base64>

# Staging URL (defaults to europe-west1)
STAGING_API_URL=https://europe-west1-marketintelligence-hub-staging.cloudfunctions.net/api
```

### Conventions

- Test data is prefixed with `_test_<timestamp>` for reliable cleanup
- Tests are ordered sequentially within each file (e.g., create then read then update)
- Permission enforcement tests verify read-only keys can't write and non-admin keys can't delete
- `apiFetch()` reads body as text first, then parses JSON (avoids "body already read" errors)

## E2E Tests (Playwright)

Playwright E2E tests live in `e2e/` and cover authentication, navigation, dashboard, research library, settings, theme consistency, and admin pages.

### Architecture

- **Page Object Model (POM)** — all page interactions are encapsulated in `e2e/pages/`. Tests import page objects rather than using raw selectors.
- **Auth strategy** — `e2e/fixtures/auth.setup.ts` signs in as both a regular user and admin, saving `storageState` to `e2e/.auth/`. Tests reuse this state via Playwright projects:
  - `chromium` — user auth (researcher role)
  - `chromium-admin` — admin auth
  - `chromium-noauth` — no auth (login page tests)
- **Theme helpers** — `e2e/helpers/theme-helpers.ts` provides CSS variable validation for light/dark mode assertions.

### Directory Structure

```
e2e/
├── .auth/           # Git-ignored saved auth state
├── fixtures/        # Auth setup + custom test function with POM fixtures
├── helpers/         # Theme color assertions, shared utilities
├── pages/           # Page Object Models (one per page/feature)
│   └── admin/       # Admin-specific POMs
└── tests/           # Test suites
    └── admin/       # Admin test suites
```

### Conventions

- Import `test` and `expect` from `e2e/fixtures/test-fixtures.ts` (not from `@playwright/test` directly)
- Use POM fixtures: `async ({ dashboardPage, appShell, page }) => { ... }`
- Tests that require admin auth go in `e2e/tests/admin/` (except `admin-access.spec.ts` which tests non-admin access)
- Clean up theme state at end of tests that change theme/density

### Environment Variables

E2E tests require these in `.env.local`:
```
E2E_USER_EMAIL=m.jilderda+e2euser@gmail.com
E2E_ADMIN_EMAIL=m.jilderda+e2eadmin@gmail.com
E2E_TEST_PASSWORD=<shared-password>
```
