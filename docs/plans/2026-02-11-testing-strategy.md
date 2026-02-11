# Testing Strategy — ResearchHub API

## Overview

API-first application. Testing focuses on correctness, security, and automation readiness. The strategy is layered: fast unit tests run locally and in CI, while Postman collections provide structured API-level testing against deployed Cloud Functions.

## Layer 1 — Unit Tests (Vitest)

**Purpose:** Validate pure business logic with no infrastructure dependencies.

**What's tested:**

- **Zod schemas** (all 7): `CreateResearch`, `UpdateResearch`, `QueryResearch`, `CreateSource`, `ValidateSource`, `UploadFile`, `CreateApiKey`
- **Trust tier system:** `getDefaultTierForTool`, `calculateTierAdjustment`, `getClassificationForTier`, `getTierDefinition`
- **Utility functions:** `cn`, `formatDate`, `getQualityTierLabel`

**How to run:**

```bash
npx vitest run          # Single run
npx vitest              # Watch mode
```

**CI:** Runs on every push/PR via `.github/workflows/ci.yml`.

**Key detail:** These tests use the app's validations from `src/lib/validations/` (Zod v4 with `z.url()`, `z.iso.datetime()`) — NOT the `functions/` schemas. The app schemas are the source of truth; the `functions/src/schemas.ts` copy is tested indirectly via Postman against the deployed API.

## Layer 2 — Postman Collection

**Purpose:** Structured manual and automated API testing against deployed Cloud Functions.

**Files:**

- Collection: `postman/researchhub-api.postman_collection.json`
- Environment: `postman/researchhub-prod.postman_environment.json`

**Environment variables:** `base_url`, `api_key`, `research_id`, `source_id`

**Folders (ordered workflow):**

1. Health
2. Auth Keys
3. Research
4. Sources
5. Files
6. Intelligence
7. Lifecycle

**Test scripts validate:**

- Status codes (200, 201, 204)
- Response shapes (required fields, correct types)
- Business rules (status transitions, tier calculations)
- Variable chaining (response values flow into subsequent requests)

**Negative tests:**

- `401` — no auth (missing or invalid API key)
- `400` — bad payload (missing required fields, invalid values)
- `404` — missing resource (nonexistent research or source ID)

**Future automation:**

```bash
npx newman run postman/researchhub-api.postman_collection.json -e postman/env.json
```

## CI Pipeline

**Workflow:** `.github/workflows/ci.yml`

**Jobs:**

- `unit-tests` — runs Vitest
- `build-check` — runs `tsc` and `next build`

Both jobs run in parallel.

**Triggers:** `push` and `pull_request` to any branch.

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Vitest over Jest | Native TypeScript support, faster execution, compatible with Zod v4 |
| Postman over code-only | Visual debugging, collection doubles as API documentation, team-friendly |
| Test data approach | Unit tests use inline fixtures; Postman uses environment variables and response chaining |
| Separate schema copies | The `functions/` directory has its own copy of schemas (`functions/src/schemas.ts`). Unit tests cover the app's schemas which are the source of truth; the functions schemas are tested indirectly via Postman against the deployed API |
