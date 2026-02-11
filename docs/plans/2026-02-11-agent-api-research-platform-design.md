# Agent-Driven Research Platform Design

**Date:** 2026-02-11
**Status:** Approved design — ready for implementation planning

## Problem Statement

ITQ's virtual agent team produces competitive research that lives in flat markdown skill files (`itq-competitors.md`, `itq-market-intelligence.md`). There is no structured way to query, cross-reference, or programmatically update this intelligence. Research discovered during one project doesn't automatically feed into others. The Researcher agent treats skill files as a static baseline with no feedback loop.

The ResearchHub needs to become the **single source of truth** for market intelligence — a system that agents both consume from and contribute to, with trust scoring, provenance tracking, and ISO-compliant audit trails.

### Key Requirements

- Agents can **add, get, and update** research programmatically across all segments, markets, and propositions
- Research files from Perplexity, NotebookLM, and other tools can be **downloaded and hosted** in the platform
- Every piece of research has a **tiered trust rating** based on source provenance and validation status
- Access via **MCP** (local Claude Code agents) and **REST API** (remote agents)
- ISO 9001/27001/42001 compliance controls embedded in the data model and workflows
- Authentication for both human users (Firebase Auth) and agents (API keys)

### Reference

See `docs/Cross-Regional Competitive Research Strategy.md` for the full context on the agent team's current limitations and the competitive landscape sweep workflow this platform enables.

---

## 1. Data Model Extensions

The existing `Research` and `Source` types in `src/types/index.ts` are extended, not replaced.

### Source — Trust Tier Lifecycle

The existing `quality_tier` field (1-8) is redefined with provenance-based defaults:

| Tier | Classification | Examples |
|------|---------------|----------|
| 1-2 | Authoritative | Official government sources, peer-reviewed publications, company filings |
| 3-4 | Established | Analyst firms (Gartner, Forrester), major trade press, official press releases |
| 5-6 | Standard | Perplexity search results, NotebookLM synthesis, reputable industry blogs |
| 7-8 | Unverified | Single-source agent analysis, unverified claims, forum posts |

New fields on `Source`:

```typescript
interface Source {
  // ...existing fields...
  validation_status: ValidationStatus;
  validated_by: string | null;       // user ID or agent ID
  validated_at: string | null;       // ISO 8601
  validation_notes: string;
}

type ValidationStatus = 'unverified' | 'corroborated' | 'human_verified' | 'disputed';
```

A source can be **upgraded** (agent finding corroborated by official source: tier 6 to tier 4) or **downgraded** (found to be outdated or inaccurate).

### Research — Provenance and Agent Metadata

```typescript
interface Research {
  // ...existing fields...
  origin: ResearchOrigin;
  agent_identity: AgentIdentity | null;
  input_context: string[];           // IDs of research/sources the agent used as input
  review_status: ReviewStatus;
}

type ResearchOrigin = 'human' | 'agent' | 'hybrid';
type ReviewStatus = 'none' | 'pending' | 'approved' | 'rejected';

interface AgentIdentity {
  agent_id: string;
  agent_name: string;
  agent_version: string;
  run_id: string;
}
```

### New Type — ApiKey

```typescript
interface ApiKey {
  id: string;
  name: string;                      // e.g., "researcher-agent-prod"
  key_hash: string;                  // SHA-256 hash, never store plaintext
  permissions: ApiKeyPermission;
  agent_identity: AgentIdentity;
  created_by: string;                // user ID of the admin who created it
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
  expires_at: string | null;
}

type ApiKeyPermission = 'read' | 'read_write' | 'admin';
```

### New Type — FileAttachment

```typescript
interface FileAttachment {
  id: string;
  research_id: string;
  source_id: string | null;
  file_name: string;
  file_type: string;                 // MIME type, validated by magic bytes
  storage_path: string;              // Firebase Storage path
  download_url: string;
  size_bytes: number;
  uploaded_by: string;               // user ID or agent ID
  uploaded_at: string;
  origin: ResearchOrigin;
}
```

### Extended Activity Actions

```typescript
type ActivityAction =
  | 'created' | 'updated' | 'deleted' | 'published' | 'archived'
  | 'login' | 'role_changed'
  // New agent/API actions:
  | 'api_access'
  | 'source_validated'
  | 'trust_tier_changed'
  | 'file_uploaded'
  | 'api_key_created'
  | 'api_key_revoked';
```

---

## 2. API Design — Cloud Functions

A shared service layer in `src/lib/services/` that both the MCP server and Cloud Functions call. Cloud Functions are thin HTTP wrappers using Firebase Functions v2.

### Input Validation

All incoming payloads are validated with Zod schemas before processing. This applies to both the REST API and MCP tool inputs.

```typescript
// Example: research creation schema
const CreateResearchSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  origin: z.enum(['human', 'agent', 'hybrid']),
  dimensions: z.object({
    market_ids: z.array(z.string()),
    domain_ids: z.array(z.string()),
    sector_ids: z.array(z.string()),
  }),
  findings: z.string(),
  sources: z.array(SourceSchema).optional(),
  input_context: z.array(z.string()).optional(),
  assumptions: z.array(z.string()).optional(),
});
```

### Research CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/research` | Create a research entry. Auto-sets `origin`, `agent_identity`, `review_status: 'pending'`. Returns created ID. |
| `GET` | `/api/research/:id` | Full research entry with sources, notebooks, file attachment URLs. |
| `GET` | `/api/research` | Query with filters: `region`, `domain`, `sector`, `origin`, `min_trust_tier`, `status`, `fresher_than`. Paginated. |
| `PATCH` | `/api/research/:id` | Update fields. Every update auto-creates an audit log entry. |
| `DELETE` | `/api/research/:id` | Soft delete (sets status to `archived`). Hard delete is admin-only. |

### Source Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/research/:id/sources` | Add sources. Agent provides URL, title, publisher, quality tier. System records provenance. |
| `PATCH` | `/api/research/:id/sources/:sourceId` | Update a source (e.g., upgrade trust tier after validation). |
| `POST` | `/api/research/:id/sources/:sourceId/validate` | Record validation event (corroborate, verify, dispute). |

### File Uploads

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/research/:id/files` | Upload file to Firebase Storage. Validates file type by magic bytes. Links to research entry. |
| `GET` | `/api/research/:id/files` | List attachments with download URLs. |

### Intelligence Query Shortcuts

These are the high-value agent endpoints — structured queries that abstract away Firestore internals:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/intelligence/competitors` | `?region=BE&domain=managed_services` — structured competitor list with trust tiers. |
| `GET` | `/api/intelligence/landscape` | `?region=BE` — full region x domain competitive matrix. |
| `GET` | `/api/intelligence/summary` | `?region=BE&domain=managed_services&format=narrative` — markdown brief for agent context. |

### Auth Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/keys` | Admin-only: create API key. Returns plaintext once. |
| `GET` | `/api/auth/keys` | Admin-only: list keys (metadata only). |
| `DELETE` | `/api/auth/keys/:id` | Revoke a key. |

### Authentication & Authorization

All endpoints validate the API key from `Authorization: Bearer <key>`:
1. Hash the provided key with SHA-256
2. Look up the hash in the `api-keys` Firestore collection
3. Check `is_active`, `expires_at`, and `permissions`
4. Log the access as an `ActivityLogEntry`
5. Reject with 401/403 if invalid

CORS is configured to allow requests from the web UI domain and agent origins. Web UI requests go through Firebase App Check for abuse prevention; agent requests bypass App Check (authenticated via API key instead).

---

## 3. MCP Server Design

The MCP server lives at `src/mcp/` in this repo. It's a Node.js stdio server that Claude Code launches as a child process. It uses the same service layer as the Cloud Functions, authenticating via a service account key on disk.

### Research Tools

| Tool | Description |
|------|-------------|
| `search_research` | Filter by region, domain, sector, trust tier, freshness. Returns structured results + narrative summaries. |
| `get_research` | Fetch a single entry by ID with full detail. |
| `add_research` | Create a new entry with metadata, findings, sources, files in one call. Auto-sets `origin: 'agent'`. |
| `update_research` | Push updates to an existing entry (new sources, revised synthesis, updated trust tiers). |

### Intelligence Shortcuts

| Tool | Description |
|------|-------------|
| `get_competitors` | Takes region and optionally domain/sector. Returns structured competitor matrix. Replaces `itq-competitors.md`. |
| `get_region_context` | Takes region code. Returns market characteristics, ITQ presence, regulatory environment. Replaces `itq-regions.md`. |
| `get_landscape` | Full region x domain matrix. The "give me the big picture" call. |

### Source Management

| Tool | Description |
|------|-------------|
| `add_source` | Attach a source to a research entry with provenance. |
| `validate_source` | Record corroboration or dispute. Agents can cross-validate each other's findings. |
| `upload_file` | Push a downloaded report to Firebase Storage and link it to a research entry. |

### Utility

| Tool | Description |
|------|-------------|
| `get_research_brief` | Token-efficient markdown summary (~500 words) for a given query. Highest-trust, most relevant information. |

### MCP Resources (Read-Only)

| URI | Description |
|-----|-------------|
| `researchhub://taxonomy/markets` | Full market hierarchy |
| `researchhub://taxonomy/domains` | Domains with default sources |
| `researchhub://taxonomy/sectors` | Sectors with regulations |
| `researchhub://config/trust-tiers` | Tier definitions for agent reference |

### Agent Workflow

1. **Check existing knowledge:** `search_research({ region: "BE", domain: "managed_services", min_trust_tier: 4 })`
2. **Conduct research:** Perplexity, NotebookLM, etc. (unchanged)
3. **Push findings:** `add_research({ title: "...", findings: "...", sources: [...], input_context: [...] })`
4. **Upload raw files:** `upload_file({ research_id: "...", file_path: "..." })`
5. **Cross-validate:** `validate_source({ source_id: "...", status: "corroborated", notes: "..." })`
6. **Human review:** Admin approves/rejects via web UI review queue

---

## 4. ISO Compliance Controls

Controls are embedded in the data model and API behavior — compliance evidence is a side effect of normal operation.

### ISO 9001 — Quality Management

| Control | Implementation |
|---------|---------------|
| Document control | Every research entry has `version_ids` lineage. Updates create new versions, never overwrite. `change_log` captures what changed. |
| Review workflow | `review_status` on agent-contributed research. Web UI surfaces "needs review" queue. Published research requires human touchpoint in audit trail. |
| Traceability | Every entry links to sources, context documents, and input prompts. Any claim traceable to origin. |
| Continuous improvement | Trust tier upgrades/downgrades and validation events create quality feedback loop. `validation_notes` captures rationale. |
| Acceptance criteria | Defined per phase in implementation roadmap. Tracked in `DECISIONS.md`. |

### ISO 27001 — Information Security

| Control | Implementation |
|---------|---------------|
| Access control | API keys with scoped permissions (read/read_write/admin). Firestore rules enforce role-based access. Keys hashed with SHA-256, never stored plaintext. |
| Input validation | All API inputs validated with Zod schemas. File types validated by magic bytes, not just extensions. File size limits enforced. |
| Audit logging | Every API call creates an `ActivityLogEntry`. Write-only from clients, readable only via Admin SDK. Immutable — no updates or deletes on audit logs. |
| Data classification | Trust tiers serve as classification levels. Tier 7-8 content explicitly flagged as unverified. Maps to Internal/Confidential matrix from security checklist. |
| Encryption | Firebase handles encryption at rest. HTTPS for all API traffic. Service account keys stored outside repo (`.gitignore`). |
| Retention | `expires_at` on research entries. Freshness policies flag stale content automatically. |
| API abuse prevention | Firebase App Check (reCAPTCHA v3) for web UI. API key rate tracking via `last_used_at` and activity logs. |
| CSP headers | Content Security Policy configured in `next.config.ts`. Cloud Functions CORS restricted to allowed origins. |
| Dependency audit | `npm audit` in CI pipeline. No high/critical vulnerabilities allowed. |

### ISO 42001 — AI Management

| Control | Implementation |
|---------|---------------|
| AI inventory | Every agent has identity record (`agent_id`, `agent_name`, `agent_version`). The `api-keys` collection doubles as AI system registry. |
| Provenance | `origin` field distinguishes human/agent/hybrid. `input_context` records what the agent based output on. Auditor can ask "why did the AI say this?" |
| Human oversight | `review_status` flags agent-contributed research. Web UI shows provenance badge so users know origin. Agent content starts unverified. |
| Data quality | Trust tiers with validation lifecycle. Agent sources start tier 5-8. Only move up through corroboration or human verification. |
| Risk proportionality | System doesn't block agents (kills automation value). Instead, makes provenance and confidence visible everywhere. Consumers make informed decisions. |
| AI traceability | `AgentIdentity` includes model version and run ID. Mapped to ISO 42001 requirement for AI system documentation. |
| Test coverage | AI-generated code and agent-contributed research both require validation. Service layer has unit tests; Cloud Functions have emulator integration tests. |

---

## 5. Architecture & File Structure

New additions marked with `+`, modified with `~`.

```
src/
├── lib/
│   ├── services/                       + Shared service layer
│   │   ├── research-crud-service.ts    + Create, read, update, delete (100-150 lines)
│   │   ├── intelligence-query-service.ts + Competitor, landscape, summary queries (100-150 lines)
│   │   ├── source-service.ts           + Source management, validation, tier logic (100-150 lines)
│   │   ├── file-service.ts             + Storage upload/download, magic byte validation (80-120 lines)
│   │   ├── auth-service.ts             + API key creation, hashing, validation (80-100 lines)
│   │   └── audit-service.ts            + Audit log creation, wraps every service call (50-80 lines)
│   ├── validations/                    + Zod schemas for all API payloads
│   │   ├── research-schemas.ts         + Research create/update schemas
│   │   ├── source-schemas.ts           + Source create/validate schemas
│   │   └── file-schemas.ts             + File upload schemas
│   ├── firebase.ts                     ~ Add Firebase Admin SDK init for server-side
│   ├── trust-tiers.ts                  + Tier definitions, provenance-to-tier mapping rules
│   └── constants.ts                    ~ Add trust tier labels, validation status labels
├── types/
│   └── index.ts                        ~ Add ApiKey, FileAttachment, provenance fields, new unions
├── mcp/
│   ├── server.ts                       + MCP server entry point (stdio transport)
│   ├── tools/
│   │   ├── research-tools.ts           + search, get, add, update research
│   │   ├── intelligence-tools.ts       + get_competitors, get_region_context, get_landscape
│   │   ├── source-tools.ts             + add, validate, upload_file
│   │   └── utility-tools.ts            + get_research_brief
│   └── resources/
│       └── taxonomy-resources.ts       + markets, domains, sectors, trust tier config
├── app/
│   └── (dashboard)/
│       └── admin/
│           ├── api-keys/               + API key management page
│           └── review-queue/           + Agent-contributed research review page
└── components/
    └── shared/
        ├── provenance-badge.tsx         + Visual indicator: human / agent / hybrid
        └── trust-tier-badge.tsx         + Visual indicator: tier + validation status
```

Cloud Functions:

```
functions/
├── src/
│   ├── index.ts                        + Function exports
│   ├── middleware/
│   │   └── auth.ts                     + API key validation middleware
│   └── routes/
│       ├── research.ts                 + Research CRUD endpoints
│       ├── intelligence.ts             + Query shortcut endpoints
│       ├── sources.ts                  + Source management endpoints
│       └── files.ts                    + File upload/download endpoints
├── package.json
└── tsconfig.json
```

Tests:

```
tests/
├── setup.ts                            + Global test setup (Vitest)
├── unit/
│   ├── services/
│   │   ├── research-crud-service.test.ts
│   │   ├── intelligence-query-service.test.ts
│   │   ├── source-service.test.ts
│   │   ├── file-service.test.ts
│   │   └── auth-service.test.ts
│   └── validations/
│       ├── research-schemas.test.ts
│       └── source-schemas.test.ts
├── integration/
│   ├── firestore-rules.test.ts         + Security rules for new collections
│   ├── api-research.test.ts            + Cloud Functions integration tests
│   └── api-auth.test.ts                + API key auth integration tests
└── mocks/
    └── firebase.ts                     + Reusable Firebase mocks
```

### Key Design Decision

`src/lib/services/` is the shared brain. Both the MCP server and Cloud Functions import from it. One place to update business logic, validation rules, trust tier calculations, and audit logging. Service files are split to stay within the 100-200 line guideline.

---

## 6. Authentication Architecture

| Consumer | Auth Method | Managed Where |
|----------|------------|---------------|
| Colleagues (web UI) | Firebase Auth (Google SSO, `@itq.nl` domain) | Self-service |
| Agents (local MCP) | Service account key on disk | Manually provisioned |
| Agents (remote API) | API key from Firestore `api-keys` collection | Admin UI (this app now, portal later) |
| Future portal (`itq-app-portal`) | Same Firebase Auth (shared Firebase project) | Shared `marketintelligence-hub` project |

### API Key Lifecycle

1. Admin creates key via admin UI or `POST /api/auth/keys`
2. System generates random key, returns plaintext **once**
3. System stores SHA-256 hash + metadata in `api-keys` collection
4. Agent includes key in `Authorization: Bearer <key>` header
5. System hashes provided key, looks up in collection, validates
6. Every API call logs access in audit trail with agent identity
7. Admin can revoke key at any time; revocation is immediate

### Firebase App Check

Web UI Firestore calls go through Firebase App Check (reCAPTCHA v3, free tier) for API abuse prevention. Agent API key requests bypass App Check — they authenticate via API key instead.

### Future Portal Integration

Both apps share the same Firebase project (`marketintelligence-hub`). Firebase Auth is per-project, so any user authenticated in one app is automatically authenticated in the other. The `api-keys` Firestore collection is accessible from both apps. When the portal takes over admin, the key management page here gets deprecated — the underlying data doesn't change.

---

## 7. Firestore Collections & Security Rules

### New Collections

```
api-keys/{keyId}                         — API key metadata (hash, permissions, agent identity)
file-attachments/{attachmentId}          — File metadata with Storage references
```

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated()
        && request.auth.token.email.matches('.*@itq[.]nl$');
    }

    // Research — authenticated read, authenticated create, owner/admin update
    match /research/{researchId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated()
        && (resource.data.author_id == request.auth.uid || isAdmin());
      allow delete: if isAdmin();
    }

    // API Keys — admin only
    match /api-keys/{keyId} {
      allow read, write: if isAdmin();
    }

    // File Attachments — authenticated read, authenticated create, no client delete
    match /file-attachments/{attachmentId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    // Audit Logs — write-only, immutable
    match /audit_logs/{logId} {
      allow read: if false;
      allow create: if isAuthenticated();
      allow update, delete: if false;
    }
  }
}
```

Note: Cloud Functions use the Admin SDK, which bypasses security rules. The rules above protect client-side access from the web UI. Agent API calls go through Cloud Functions (Admin SDK).

---

## 8. Cost Considerations

This is a hobbyist project — keep costs on Firebase free/Blaze tier minimums.

| Resource | Cost Model | Mitigation |
|----------|-----------|------------|
| Cloud Functions | Free: 2M invocations/month | Agent traffic well within limits |
| Firestore | Free: 50K reads, 20K writes/day | Moderate agent usage fits |
| Firebase Storage | Free: 5GB storage, 1GB/day download | Uploaded reports are small (KB-MB) |
| Scheduled sweeps | Cloud Scheduler costs $0.10/job/month | Use GitHub Actions cron (free) hitting the API instead |
| Firebase App Check | Free (reCAPTCHA v3) | No cost |
| Firebase Emulators | Free (local) | Use for all development and testing |

### Cost Rules

- No scheduled Cloud Functions — use external cron (GitHub Actions) for periodic sweeps
- Firebase Emulators for all local development and testing
- Monitor usage via Firebase Console; set budget alerts at $5/month

---

## 9. Testing Strategy

Following the testing patterns from `itq-dev-patterns`.

### Unit Tests (Vitest)

- All service files in `src/lib/services/` — mock Firestore, test business logic
- All Zod schemas in `src/lib/validations/` — test valid/invalid payloads
- Trust tier mapping logic in `trust-tiers.ts`
- API key hashing and validation in `auth-service.ts`

### Integration Tests (Firebase Emulators)

- Firestore security rules for `api-keys`, `file-attachments`, `audit_logs`, `research`
- Cloud Functions endpoints against emulator Firestore
- File upload flow with Storage emulator
- API key auth middleware against emulator

### MCP Server Tests

- Tool input/output validation
- Service layer integration (MCP tools call the same services as Cloud Functions)

### Test Commands

```bash
npm run test              # Unit tests (Vitest)
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
npm run test:rules        # Firestore rules against emulator
```

### Emulator Configuration

```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "functions": { "port": 5001 },
    "storage": { "port": 9199 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

All development and testing uses emulators. Production Firestore is never hit during development.

---

## 10. Implementation Phases

### Phase 1 — Data Model & Service Layer (Foundation)

- Extend types in `index.ts` with provenance, trust tiers, validation lifecycle, API keys, file attachments
- Create Zod schemas in `src/lib/validations/`
- Build `src/lib/services/` — research CRUD, intelligence queries, source management, file service, auth, audit
- Create `trust-tiers.ts` with provenance-to-tier mapping
- Add Firestore security rules for new collections
- Add Firebase Emulator config
- Unit tests for all services and schemas
- Integration tests for security rules

**Acceptance criteria:**
- Service layer passes all unit tests against mocked Firestore
- Security rules pass all emulator integration tests
- Zod schemas reject malformed payloads

### Phase 2 — REST API (Cloud Functions)

- Set up Firebase Cloud Functions v2 in `functions/`
- Implement research CRUD endpoints with Zod validation
- Implement source management and file upload endpoints
- Implement intelligence query shortcuts
- API key auth middleware
- CORS configuration
- Integration tests against emulator
- CSP headers on Next.js app

**Acceptance criteria:**
- All endpoints return correct responses for valid/invalid inputs
- API key auth correctly grants/denies access based on permissions
- File uploads validate by magic bytes
- Audit logs created for every API call

### Phase 3 — MCP Server

- Build `src/mcp/` with stdio transport
- Implement research tools, intelligence tools, source tools, utility tools
- Add MCP resources for taxonomy data
- Configure in `.mcp.json`
- Test end-to-end: agent queries, researches, pushes back

**Acceptance criteria:**
- Claude Code agent can `search_research`, `add_research`, `upload_file` in sequence
- MCP resources return current taxonomy data
- All MCP tool calls are audit-logged

### Phase 4 — Web UI Extensions

- Add admin page: API key management (create, list, revoke)
- Add admin page: review queue for agent-contributed research
- Add `ProvenanceBadge` component (human/agent/hybrid indicator)
- Add `TrustTierBadge` component (tier number + validation status)
- Surface provenance and trust tiers on research detail pages

**Acceptance criteria:**
- Admin can create, view, and revoke API keys
- Review queue shows all `review_status: 'pending'` entries with provenance
- Research detail page clearly distinguishes agent vs human content

### Phase 5 — Agent Integration & Validation

- Update Researcher agent to use MCP tools instead of flat skill files
- Run competitive landscape sweep (Option B from strategy doc) against live system
- Validate trust tier lifecycle: agent writes, cross-validation, human review
- Confirm audit trail completeness for ISO evidence
- Set up GitHub Actions cron for scheduled sweeps (hitting REST API)

**Acceptance criteria:**
- Parallel competitive sweep produces region-tagged research entries in the platform
- Trust tiers correctly upgrade when sources are corroborated
- Audit trail answers: "who produced this, when, based on what, and who reviewed it?"
- Scheduled sweep runs via GitHub Actions without Cloud Scheduler costs

---

## Appendix: Agent Workflow Example

Using the Belgium Managed Services competitive update as an example:

```
1. Agent checks existing knowledge:
   search_research({ region: "BE", domain: "managed_services", min_trust_tier: 4 })
   -> Returns 3 existing entries with structured metadata + narrative summaries

2. Agent conducts research:
   Uses Perplexity for real-time competitive data
   Uses NotebookLM for synthesis of longer reports
   Downloads outputs

3. Agent pushes findings:
   add_research({
     title: "Belgium Managed Services Competitive Update - 2026-02",
     origin: "agent",
     dimensions: { markets: ["BE"], domains: ["managed_services"] },
     findings: "## Key Changes\n\nOpen Line (now Conscia)...",
     sources: [
       { url: "...", publisher: "Computable BE", quality_tier: 4, discovered_by: "perplexity" },
       { url: "...", publisher: "Conscia press release", quality_tier: 2, discovered_by: "perplexity" }
     ],
     input_context: ["research/abc123", "research/def456"],
     assumptions: ["Conscia acquisition based on press release, not confirmed in KvK"]
   })
   -> System sets review_status: 'pending', records agent identity, creates audit entry

4. Agent uploads raw files:
   upload_file({ research_id: "...", file_path: "/output/be-managed-services-perplexity.md" })
   upload_file({ research_id: "...", file_path: "/output/be-managed-services-notebooklm.pdf" })
   -> Files validated by magic bytes, stored in Firebase Storage, linked to research entry

5. Cross-validation (subsequent agent run):
   validate_source({ source_id: "...", status: "corroborated", notes: "Confirmed via KvK filing" })
   -> Trust tier auto-upgrades from 5 to 3

6. Human review (web UI):
   Admin sees entry in review queue with provenance badge, trust tiers, input context
   Approves -> review_status: 'approved', audit trail updated
```

The feedback loop: agents produce intelligence, the system scores and stores it, humans validate, and every subsequent agent run starts from a richer baseline.
