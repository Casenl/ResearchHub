# Competitor Intelligence Feature — Design & Implementation Plan

## Context

ITQ competes with different players in each country across its four propositions (Security, Hybrid Cloud, Digital Workspace, AI Services), and these competitors can also vary by sector. Currently, competitive analysis lives as one-off research notebooks — snapshots without continuity. This feature adds a persistent **Competitor Intelligence** section to the portal where ITQ employees can maintain living competitor profiles, track competitive positions per market x domain, and build event-based timelines that reveal market trends over time. Agents will periodically enrich profiles and fill timelines via the REST API and MCP.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Competitor scope | Both MSPs and vendor-partner ecosystems | ITQ faces both direct MSP competition and vendor channel dynamics |
| Architecture | Hybrid (standalone + research-enriched) | Competitors need their own home but should be enrichable from research workflow |
| Positioning granularity | Full matrix (market x domain) | A competitor's Security play in NL differs from their Cloud play in DE |
| Time tracking | Event-based timeline | Discrete events (launches, M&A, partnerships) build a chronological view of market movement |
| Navigation | Top-level nav item | Signals competitor intelligence as a core part of the intelligence workflow |
| Agent enrichment | REST API + MCP | Agents periodically investigate competitor news and push events/position updates |

## Data Model

### New Types (`src/types/index.ts`)

```typescript
// Union types
type CompetitorType = 'msp' | 'vendor_partner' | 'both';
type CompetitorEventType =
  | 'service_launch' | 'acquisition' | 'partnership'
  | 'market_entry' | 'market_exit' | 'pricing_change'
  | 'certification' | 'leadership_change' | 'funding'
  | 'other';
type PackagingModel = 'managed' | 'project' | 'hybrid' | 'consulting';

// Company-level entity
interface Competitor {
  id: string;
  name: string;
  description: string;               // Markdown
  website: string;
  logo_url: string | null;           // Firebase Storage
  type: CompetitorType;
  headquarters_market_id: string;    // Links to Market
  employee_range: string;            // e.g. "1000-5000"
  revenue_range: string;             // e.g. "100M-500M EUR"
  founded_year: number | null;
  positions: CompetitorPosition[];   // Embedded array
  events: CompetitorEvent[];         // Embedded array
  tag_ids: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Per market x domain competitive position
interface CompetitorPosition {
  id: string;
  market_id: string;
  domain_id: string;
  sector_ids: string[];              // Which sectors they target here
  services: string[];                // Service names/descriptions
  packaging_model: PackagingModel;
  vendor_partnerships: string[];     // Vendor names
  strengths: string;                 // Markdown
  weaknesses: string;               // Markdown
  notes: string;                     // Markdown
  updated_at: string;
  updated_by: string;
}

// Timeline event
interface CompetitorEvent {
  id: string;
  event_type: CompetitorEventType;
  title: string;
  description: string;              // Markdown
  date: string;                     // ISO 8601 date
  market_ids: string[];
  domain_ids: string[];
  sector_ids: string[];
  source_url: string;               // Where the intel came from
  origin: ResearchOrigin;           // 'human' | 'agent' | 'hybrid'
  agent_identity: AgentIdentity | null;
  created_at: string;
  created_by: string;
}
```

### Firestore Collection

- `competitors/{id}` — single document with `positions[]` and `events[]` embedded (matches existing Research pattern with embedded notebooks/sources)

## File Plan

### Phase 1: Data Model & Service Layer

| # | File | Action | Description |
|---|------|--------|-------------|
| 1 | `src/types/index.ts` | Edit | Add `CompetitorType`, `CompetitorEventType`, `PackagingModel` union types + `Competitor`, `CompetitorPosition`, `CompetitorEvent` interfaces |
| 2 | `src/lib/constants.ts` | Edit | Add label maps: `COMPETITOR_TYPE_LABELS`, `COMPETITOR_EVENT_TYPE_LABELS`, `PACKAGING_MODEL_LABELS` |
| 3 | `src/lib/firestore/converters.ts` | Edit | Add `competitorConverter` using existing `createConverter()` factory |
| 4 | `src/lib/firestore/competitors.ts` | New | Firestore service: `subscribeCompetitors()`, `subscribeCompetitorById()`, `createCompetitor()`, `updateCompetitor()`, `deleteCompetitor()` — follow `context-documents.ts` pattern |
| 5 | `src/lib/firestore/index.ts` | Edit | Add `export * from "./competitors"` |
| 6 | `src/hooks/use-competitors.ts` | New | Hooks: `useCompetitors()`, `useCompetitorById()`, `useCreateCompetitor()`, `useUpdateCompetitor()`, `useDeleteCompetitor()` — follow `use-context-documents.ts` pattern |
| 7 | `src/data/mock-competitors.ts` | New | Mock data: 3-4 sample competitors with positions and events for loading fallback |

### Phase 2: UI Pages

| # | File | Action | Description |
|---|------|--------|-------------|
| 8 | `src/components/layout/app-shell.tsx` | Edit | Add "Competitors" nav item (Swords or Target icon) + "Add Competitor" item to main section |
| 9 | `src/app/(dashboard)/competitors/page.tsx` | New | **Listing page** — competitor cards with filters (market, domain, type, search). Shows name, type, active markets count, recent events count |
| 10 | `src/app/(dashboard)/competitors/new/page.tsx` | New | **Create page** — company-level form (name, type, website, HQ market, size, description). Can add initial positions |
| 11 | `src/app/(dashboard)/competitors/[id]/page.tsx` | New | **Detail page** — tabbed layout (Overview, Positions, Timeline, Related Research) |
| 12 | `src/app/(dashboard)/competitors/[id]/_components/overview-tab.tsx` | New | Company info, summary stats, quick links |
| 13 | `src/app/(dashboard)/competitors/[id]/_components/positions-tab.tsx` | New | Grid of positions by market x domain. Click to view/edit. Add position button |
| 14 | `src/app/(dashboard)/competitors/[id]/_components/timeline-tab.tsx` | New | Chronological event list with filters. Add event form. Agent-contributed events marked with origin badge |
| 15 | `src/app/(dashboard)/competitors/[id]/_components/position-form.tsx` | New | Form for creating/editing a competitive position (market, domain, sectors, services, vendors, strengths/weaknesses) |
| 16 | `src/app/(dashboard)/competitors/[id]/_components/event-form.tsx` | New | Form for adding timeline events (type, title, description, date, dimensions, source URL) |

### Phase 3: API Routes (Agent & MCP Access)

| # | File | Action | Description |
|---|------|--------|-------------|
| 17 | `functions/src/schemas.ts` | Edit | Add Zod schemas: `CreateCompetitorSchema`, `UpdateCompetitorSchema`, `AddPositionSchema`, `AddEventSchema` |
| 18 | `functions/src/routes/competitors.ts` | New | REST endpoints: `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `POST /:id/positions`, `PUT /:id/positions/:positionId`, `POST /:id/events`, `GET /:id/events` |
| 19 | `functions/src/app.ts` | Edit | Mount competitors router: `app.use("/competitors", competitorsRouter)` |

### Phase 4: Integration & Housekeeping

| # | File | Action | Description |
|---|------|--------|-------------|
| 20 | `src/lib/__tests__/routes.test.ts` | Edit | Add `/competitors`, `/competitors/new`, `/competitors/[id]` to `EXPECTED_ROUTES` |
| 21 | `CLAUDE.md` | Edit | Add competitors routes to Route Groups table, update Directory Structure, add to Maintenance table |
| 22 | `docs/api-reference.md` | Edit | Document competitor API endpoints |

## Page Designs

### Listing Page (`/competitors`)
- **Header:** "Competitors" title + count + "Add Competitor" button
- **Filters:** Search bar, competitor type toggle, market dropdown, domain dropdown
- **Grid:** Cards showing competitor name, type badge, HQ flag, domains active in (as badges), number of tracked positions, latest event date
- **Empty state:** "No competitors tracked yet" with CTA to add first

### Detail Page (`/competitors/[id]`)
- **Header:** Competitor name, type badge, website link, edit/delete actions
- **Tabs:**
  1. **Overview** — description (markdown), company stats (HQ, size, revenue, founded), vendor partnerships aggregated across positions, sector focus aggregated
  2. **Positions** — filterable grid by market/domain. Each card shows: market+domain header, services list, packaging model, vendor partnerships, strengths/weaknesses. Click to expand/edit. "Add Position" button
  3. **Timeline** — reverse-chronological event list. Each event: date, type icon, title, description, source link, origin badge (human/agent). Filter by event type, dimension. "Add Event" button
  4. **Related Research** — research items that selected the same market+domain combinations (future: explicit linking via `competitor_ids` on Research)

## Agent Integration

Agents use the existing API key auth system to enrich competitors via REST API or MCP:

```
# Create a competitor
POST /api/competitors
Authorization: Bearer <api-key>

# Add a position
POST /api/competitors/:id/positions
Authorization: Bearer <api-key>

# Add a timeline event (news, launches, M&A, etc.)
POST /api/competitors/:id/events
Authorization: Bearer <api-key>
```

Events created by agents automatically get `origin: "agent"` and the agent's identity recorded — matching the existing pattern on Research. The timeline tab shows an "Agent" badge on these entries for transparency.

## MCP Integration

The ResearchHub MCP server already exposes `get_competitors` and `get_landscape` tools. Once the new REST API endpoints are built, update the MCP server to wrap them — giving agents two integration paths:

1. **REST API** — direct HTTP calls with API key auth (for automated pipelines, cron-based enrichment)
2. **MCP** — tool-based access (for Claude/agent sessions doing interactive research)

Both use the same underlying endpoints. The MCP server just needs new tool definitions for `create_competitor`, `update_competitor`, `add_competitor_position`, and `add_competitor_event`.

## Existing Code to Reuse

| What | File |
|------|------|
| `createConverter()` factory | `src/lib/firestore/converters.ts:61-78` |
| `getFirestoreDb()` lazy init | `src/lib/firebase.ts` |
| `timestampToISO()` helper | `src/lib/firestore/converters.ts:35-51` |
| CRUD service pattern | `src/lib/firestore/context-documents.ts` |
| Hook pattern (list, byId, mutations) | `src/hooks/use-context-documents.ts` |
| Page layout pattern | `src/app/(dashboard)/context-library/` |
| Tabbed detail page | `src/app/(dashboard)/research/[id]/` |
| Filter bar pattern | `src/app/(dashboard)/context-library/page.tsx:150-163` |
| `DimensionTags` component | `src/components/shared/` |
| `StatusBadge` component | `src/components/shared/` |
| API auth middleware | `functions/src/middleware/auth.ts` |
| Zod validation pattern | `functions/src/schemas.ts` |
| Express route pattern | `functions/src/routes/research.ts` |
| `AgentIdentity` type | `src/types/index.ts:104-109` |
| `ResearchOrigin` type | `src/types/index.ts:84` |

## Verification

1. **Dev server:** `npm run dev` — verify all three competitor pages render without errors
2. **Navigation:** Competitors appears in sidebar, active state works on all sub-routes
3. **CRUD flow:** Create a competitor, add positions, add events, view timeline, delete
4. **Lint:** `npm run lint` passes with zero warnings
5. **Build:** `npm run build` succeeds
6. **Unit tests:** `npm run test` — route manifest test passes with new routes
7. **Functions build:** `cd functions && npm run build` — compiles without errors
8. **Functions tests:** `cd functions && npm test` — existing tests still pass
9. **API test (manual):** Use curl/Postman to test competitor endpoints against staging
