# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ITQ Market Intelligence Portal — an internal Next.js application where ITQ employees can search, consult, and initiate structured market research across geographies, domains, and sectors. The portal is both a **library** (find and read research) and a **workbench** (define, execute, and publish research).

## Commands

```bash
# Development
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint

# Testing
npm run test          # Run unit tests (Vitest)
npm run test:e2e      # Run E2E tests (Playwright, requires dev server)
npm run test:e2e:ui   # Open Playwright UI mode (interactive)
npm run test:e2e:headed  # Run with visible browser

# Cloud Functions testing (run from functions/)
cd functions
npm test              # Run unit tests (88 tests, mocked Firestore/Storage)
npm run test:integration  # Run integration tests (35 tests, hits staging)

# Deployment
npm run deploy:staging:rules   # Deploy Firestore + Storage rules to staging
cd functions
npm run deploy                 # Deploy functions to production
npm run deploy:staging         # Deploy functions to staging
```

## Child Docs

Detailed docs are in `docs/`. Read the relevant doc when working in that area:

- **[Testing](docs/testing.md)** — Cloud Functions unit/integration tests, E2E (Playwright), conventions, env vars
- **[API Reference](docs/api-reference.md)** — REST endpoints, data model, Firestore collections, indexes
- **[Code Patterns](docs/code-patterns.md)** — Firebase lazy init, Firestore loading/writing, import order, auth, frontend aesthetics

Global standards (type safety, naming, file size, security, React patterns) are in `~/.claude/docs/`.

## Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript, React 19) |
| Styling | Tailwind CSS v4 (CSS-based config, no tailwind.config) |
| UI Components | Radix UI primitives + Lucide React icons |
| Backend | Firebase (Firestore, Auth, Storage) |
| Auth | Firebase Auth (Google + Email/Password) |
| Utilities | date-fns, uuid, clsx + tailwind-merge, react-markdown |

### Directory Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (Providers wrapper)
│   ├── providers.tsx             # Client-side providers (AuthProvider)
│   ├── globals.css               # Tailwind v4 theme variables
│   ├── login/                    # Standalone login page (no AppShell)
│   └── (dashboard)/              # Route group — all pages wrapped in AppShell
│       ├── layout.tsx            # Dashboard layout (AppShell)
│       ├── page.tsx              # Dashboard home
│       ├── research/             # Research Library, detail, wizard
│       ├── context-library/      # Context Library CRUD
│       ├── settings/             # User preferences (appearance, notifications)
│       └── admin/                # Admin pages (taxonomy, users, api-keys, prompts, etc.)
├── components/
│   ├── ui/                       # Base primitives (Badge, Button, Card, Input, Textarea, ConfirmDialog)
│   ├── layout/                   # AppShell (sidebar + header + main)
│   └── shared/                   # Domain components (StatusBadge, DimensionTags, TrustTierBadge, etc.)
├── hooks/                        # Custom React hooks
│   ├── use-auth.tsx              # Firebase Auth provider + hook
│   ├── use-research.ts           # Research CRUD operations
│   ├── use-context-documents.ts  # Context document operations
│   ├── use-taxonomy.ts           # Taxonomy data access
│   ├── use-firestore-collection.ts  # Generic collection hook
│   ├── use-firestore-document.ts    # Generic document hook
│   ├── use-admin-data.ts         # Admin dashboard data
│   ├── use-activity.ts           # Audit log data
│   ├── use-usage.ts              # API usage stats
│   ├── use-users.ts              # User management
│   ├── use-research-transition.ts   # Research workflow state machine
│   ├── use-theme.tsx             # Theme/density preferences
│   └── use-toast.tsx             # Toast notifications
├── lib/                          # Utilities and services
│   ├── firebase.ts               # Firebase client lazy init (SSR-safe)
│   ├── firebase-admin.ts         # Firebase Admin SDK (server-side scripts)
│   ├── utils.ts                  # cn(), formatDate(), generateId(), etc.
│   ├── constants.ts              # Label maps, configs, enums
│   ├── prompt-templates.ts       # Research prompt generation engine
│   ├── trust-tiers.ts            # Source quality tier definitions
│   ├── research-workflow.ts      # Research status transition logic
│   └── firestore/                # Firestore service layer
│       ├── index.ts              # Barrel export for all services
│       ├── converters.ts         # Firestore ↔ TypeScript converters
│       ├── research.ts           # Research CRUD
│       ├── taxonomy.ts           # Taxonomy reads
│       ├── context-documents.ts  # Context document CRUD
│       ├── users.ts              # User profile operations
│       ├── admin.ts              # Admin data (api-keys, prompts, rules)
│       ├── activity.ts           # Audit log queries
│       ├── usage.ts              # API usage aggregation
│       └── settings.ts           # User/system settings
├── types/
│   └── index.ts                  # All TypeScript types and union types
└── data/                         # Seed data and mock data
    ├── markets.ts                # Market taxonomy (hierarchical)
    ├── domains.ts                # Domain taxonomy with default sources
    ├── sectors.ts                # Sector taxonomy with regulations
    ├── tags.ts                   # System tags
    ├── mock-research.ts          # Mock research data (MVP)
    └── mock-context-documents.ts # Mock context documents (MVP)
```

### Cloud Functions Architecture

```
functions/
├── src/
│   ├── index.ts              # Entry point — exports `api` Cloud Function (europe-west1)
│   ├── app.ts                # Express app — mounts all routes, CORS, auth middleware
│   ├── schemas.ts            # Zod validation schemas for all endpoints
│   ├── lib/
│   │   └── admin.ts          # Firebase Admin SDK lazy init (db(), storage())
│   ├── middleware/
│   │   └── auth.ts           # API key auth — SHA-256 hash lookup, permission checks
│   └── routes/
│       ├── research.ts       # CRUD for research documents
│       ├── sources.ts        # Source management within notebooks
│       ├── files.ts          # File upload to Storage + Firestore metadata
│       ├── intelligence.ts   # Competitors, landscape, summary endpoints
│       └── auth-keys.ts      # API key lifecycle (create/list/revoke)
├── __tests__/                # Unit tests (mocked) + integration tests (staging)
├── vitest.config.ts          # Unit test config (excludes integration/)
├── vitest.integration.config.ts  # Integration test config
├── tsconfig.json
└── package.json
```

### Key Files

- `src/types/index.ts` — All TypeScript types; **single source of truth** for the data model
- `src/lib/firebase.ts` — Lazy Firebase client initialization; **never** import at module level in server components
- `src/lib/firestore/index.ts` — Barrel export for all Firestore service modules
- `src/lib/firestore/converters.ts` — Firestore ↔ TypeScript data converters
- `src/hooks/use-auth.tsx` — Auth state, sign-in/out methods, role derivation
- `src/lib/prompt-templates.ts` — Generates discovery/analysis/synthesis prompts per domain and notebook type
- `src/lib/constants.ts` — All label maps, notebook configs, refresh schedules, time estimates
- `src/lib/research-workflow.ts` — Research status transition logic and validation
- `src/components/layout/app-shell.tsx` — Main navigation shell; wraps all authenticated pages
- `functions/src/app.ts` — Express app mounting all API routes
- `functions/src/schemas.ts` — Zod schemas for all API request validation
- `functions/src/middleware/auth.ts` — API key authentication and permission middleware

### Route Groups

| Route | Purpose | Auth required |
|-------|---------|--------------|
| `/login` | Sign in / sign up (standalone layout, no sidebar) | No |
| `/` | Dashboard with overview stats | Yes |
| `/research` | Research Library listing with search + filters | Yes |
| `/research/new` | Research Wizard (multi-step form) | Yes |
| `/research/[id]` | Research detail with tabs | Yes |
| `/context-library` | Context Library listing | Yes |
| `/context-library/new` | Upload context document | Yes |
| `/context-library/[id]` | Context document detail | Yes |
| `/settings` | User appearance + notification preferences | Yes |
| `/admin/taxonomy` | Taxonomy management | Yes (admin) |
| `/admin/users` | User management | Yes (admin) |
| `/admin/api-keys` | API key management for agents | Yes (admin) |
| `/admin/prompts` | Prompt template configuration | Yes (admin) |
| `/admin/context-rules` | Context injection rules | Yes (admin) |
| `/admin/review-queue` | Research review workflow | Yes (admin) |
| `/admin/activity` | Audit log viewer | Yes (admin) |
| `/admin/usage` | API usage analytics | Yes (admin) |
| `/admin/coverage` | Research coverage dashboard | Yes (admin) |
| `/admin/settings` | System-wide settings | Yes (admin) |

## Environment Variables

Next.js uses `NEXT_PUBLIC_` prefix for client-side variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### Firebase Projects

| Environment | Project ID | Purpose |
|-------------|-----------|---------|
| Production | `marketintelligence-hub` | Live application |
| Staging | `marketintelligence-hub-staging` | Integration tests, pre-deploy validation |

Both projects share identical Firestore rules, Storage rules, and Cloud Functions code. The staging alias is configured in `.firebaserc`.

Credentials are stored in `.env.local` (not committed).

### Firebase Service Account Keys

| Key file | Project | Used by |
|----------|---------|---------|
| `./marketintelligence-hub-firebase-adminsdk-fbsvc-6dc224a6ce.json` | Production | Firebase MCP server (`.mcp.json`) |
| `./marketintelligence-hub-staging-sa-key.json` | Staging | Integration tests |

Both files are listed in `.gitignore` and must **never** be committed. For CI, the staging key is stored as GitHub secret `STAGING_SA_KEY_BASE64` (base64-encoded).

## CI Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and PR:

| Job | What it does | Depends on |
|-----|-------------|------------|
| `unit-tests` | Vitest unit tests (Next.js) | -- |
| `build-check` | TypeScript type-check + Next.js production build | -- |
| `functions-build` | Compile Cloud Functions TypeScript | -- |
| `functions-tests` | Cloud Functions unit tests | -- |
| `functions-integration` | Cloud Functions integration tests (staging) | `functions-tests`, `functions-build` |

The integration job only runs on `main` and PRs. It requires the `STAGING_SA_KEY_BASE64` GitHub secret.

## MCP Servers

Configured in `.mcp.json`:
- **Context7** — library documentation lookups for up-to-date API references
- **Firebase MCP** — direct Firestore/Auth/Storage operations via the service account key at project root

## Research Process Reference

The portal implements the ITQ standardised research process:
1. **Define** — select dimensions (market, domain, sector) and output format
2. **Structure** — determine notebook types (N1-N4) based on format
3. **Discover** — find sources using generated prompts (Perplexity/Claude/NotebookLM)
4. **Analyse** — run targeted analysis prompts per notebook
5. **Synthesise** — combine results with ITQ context documents
6. **Publish** — review, tag, set refresh schedule, publish

The prompt template engine (`lib/prompt-templates.ts`) generates domain-specific prompts for steps 3-5.

## Post-Push CI Verification

Follow the global post-push workflow in `~/.claude/docs/ci-cd.md`. Project-specific patterns:

### Known CI Failure Patterns

| Pattern | Root cause | Prevention |
|---------|-----------|------------|
| Integration tests skipped | Expected on feature branch pushes | Integration tests only run on `main` and PRs (`if:` condition in CI) |
| `auth/argument-error` on Google sign-in | `initializeAuth()` called without `popupRedirectResolver` | Always pass `browserPopupRedirectResolver` when using `initializeAuth()`. See `docs/code-patterns.md` for details. Validated by `firebase-config.test.ts` unit tests. |

## Maintenance

When to update these docs:

| Trigger | Update |
|---------|--------|
| New route added | Route Groups table in this file |
| New hook or service module | Directory Structure tree in this file |
| New API endpoint | `docs/api-reference.md` |
| New Firestore collection | `docs/api-reference.md` collection paths |
| Test infrastructure changed | `docs/testing.md` |
| CI job added/changed | CI Pipeline table in this file |
| New Firebase pattern or gotcha | `docs/code-patterns.md` |
| CI failure caused by preventable mistake | Known CI Failure Patterns table above |

The global Self-Improving Guidelines (`~/.claude/CLAUDE.md`) also apply: when fixing a bug reveals a documentation gap, propose the specific update.
