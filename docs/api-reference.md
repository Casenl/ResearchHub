# API Reference

## Endpoints

Base URL: `https://europe-west1-marketintelligence-hub-staging.cloudfunctions.net/api` (staging) or production equivalent.

All endpoints (except `/health`) require `Authorization: Bearer <api-key>` header.

| Method | Path | Permission | Purpose |
|--------|------|-----------|---------|
| GET | `/health` | None | Health check |
| POST | `/research` | read_write, admin | Create research |
| GET | `/research` | read+ | Query with filters |
| GET | `/research/:id` | read+ | Get single research |
| PATCH | `/research/:id` | read_write, admin | Update research |
| DELETE | `/research/:id` | admin | Archive (soft delete) |
| POST | `/research/:id/sources` | read_write, admin | Add source to notebook |
| PATCH | `/research/:id/sources/:sourceId` | read_write, admin | Update source fields |
| POST | `/research/:id/sources/:sourceId/validate` | read_write, admin | Validate + adjust tier |
| POST | `/research/:id/files` | read_write, admin | Upload file (base64) |
| GET | `/research/:id/files` | read+ | List file attachments |
| GET | `/competitors` | read+ | List all competitors |
| POST | `/competitors` | read_write, admin | Create competitor |
| GET | `/competitors/:id` | read+ | Get single competitor |
| PUT | `/competitors/:id` | read_write, admin | Update competitor |
| POST | `/competitors/:id/positions` | read_write, admin | Add competitive position |
| PUT | `/competitors/:id/positions/:posId` | read_write, admin | Update position |
| POST | `/competitors/:id/events` | read_write, admin | Add timeline event |
| GET | `/competitors/:id/events` | read+ | List events (reverse-chronological) |
| GET | `/intelligence/competitors` | read+ | Competitor analysis by region |
| GET | `/intelligence/landscape` | read+ | Domain landscape by region |
| GET | `/intelligence/summary` | read+ | Research brief (narrative/structured) |
| POST | `/auth/keys` | admin | Create API key |
| GET | `/auth/keys` | admin | List keys (no hashes) |
| DELETE | `/auth/keys/:id` | admin | Revoke key |

## Data Model

Defined in `src/types/index.ts`. The three core dimension types (Market, Domain, Sector) form classification axes for all research and context documents.

- **Research** — the primary artifact; contains notebooks, sources, synthesis, assumptions, version lineage
- **Competitor** — a tracked competitor with embedded positions (per market x domain) and timeline events
- **ContextDocument** — ITQ internal docs or curated external sources used as research input
- **Notebook** — a research lens (market_regulation, competitive, business_model, local_sector)
- **Source** — a reference with quality tier (1-8) and discovery tool attribution

## Firestore Collection Paths

```
research/{researchId}                    — Research documents
research/{researchId}/notebooks/{nbId}   — Notebook sub-collection
competitors/{competitorId}               — Competitor profiles (embedded positions[] + events[])
context-documents/{docId}                — Context Library documents
taxonomy/markets                         — Market taxonomy
taxonomy/domains                         — Domain taxonomy
taxonomy/sectors                         — Sector taxonomy
taxonomy/tags                            — Tags
users/{userId}                           — User profiles and roles
api-keys/{keyId}                         — API keys (SHA-256 hashed, admin only)
file-attachments/{attachmentId}          — File metadata (Storage refs)
audit_logs/{logId}                       — Audit trail (admin-readable)
app-settings/global                      — Platform-wide settings
api-usage/{entryId}                      — API usage records (admin-readable)
```

## Firestore Indexes

Composite indexes are defined in `firestore.indexes.json` and deployed to both production and staging:

- `file-attachments`: `research_id` ASC + `uploaded_at` DESC (used by file listing endpoint)
