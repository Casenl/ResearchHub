# Testing Roadmap — Deferred Work

## What's Delivered Now

- Unit tests (Vitest) for schemas, trust tiers, and utilities — running in CI
- Postman collection covering all 18 API endpoints with test scripts
- CI workflow running unit tests and build checks on every push/PR
- `validate-lifecycle.ts` script for end-to-end smoke testing against deployed API

## What's Deferred

### Layer 3 — Firebase Emulator Integration Tests

**Rationale:** No staging environment exists yet. Will be added when Firebase staging project is created.

**Prerequisites:**

- Create a Firebase staging project
- Configure `firebase.json` with emulator settings (Firestore port 8080, Auth port 9099, Storage port 9199)
- Install `@firebase/rules-unit-testing` as devDependency

**What to test:**

- Service functions (`research-crud-service`, `source-service`, `auth-service`, `file-service`, `intelligence-query-service`, `audit-service`) against emulated Firestore
- Full trust tier lifecycle: create research -> add source -> validate -> check tier change -> verify audit log
- Concurrent access patterns (two agents updating the same research)

**Trigger:** When you create a Firebase staging project, implement this layer.

### Layer 4 — Security Rules Tests

**Rationale:** Depends on Firebase Emulator setup (Layer 3).

**Prerequisites:** Same as Layer 3.

**What to test:**

- Unauthenticated users cannot read/write any collection
- Researchers can read research but only update their own
- Admins can read/write everything
- API key collection is admin-only
- Audit logs are write-only (no client reads)

**Trigger:** Same as Layer 3.

### Newman CI Integration

**Rationale:** Requires deployed API with stable URL and test API key.

**Prerequisites:**

- Cloud Functions deployed to production
- Test API key created and stored as GitHub secret
- Newman installed as devDependency

**Implementation:** Add a `api-tests` job to `ci.yml` that runs after deploy:

```yaml
- run: npx newman run postman/researchhub-api.postman_collection.json -e postman/env.json
```

**Trigger:** After first successful production deployment and API key creation.

### Staging Environment

**Rationale:** Not needed until the app has real users/data to protect.

**Implementation:**

- Create a second Firebase project (e.g., `marketintelligence-hub-staging`)
- Add a `staging` branch with its own `.env.local`
- Deploy Cloud Functions with `firebase use staging && firebase deploy`
- Create a Postman environment `researchhub-staging`

**Trigger:** Before the app goes to production with real users.

## Decision Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Skip emulator tests for now | No staging env, deploy direct to prod (no live traffic yet) | 2026-02-11 |
| Postman for API testing | Visual debugging, doubles as docs, team-friendly | 2026-02-11 |
| Vitest over Jest | Native TS, faster, Zod v4 compatible | 2026-02-11 |
| Deploy to prod first | No live users yet, staging comes later | 2026-02-11 |
