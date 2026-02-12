# MCP & Agent Integration Guide

How to connect AI agents to the ITQ Market Intelligence Portal via the REST API or the ResearchHub MCP server.

## Overview

Two access methods are available:

| Method | Transport | Auth | Best for |
|--------|-----------|------|----------|
| **REST API** | HTTPS (Cloud Functions) | API key (Bearer token) | Remote agents, CI pipelines, external systems |
| **ResearchHub MCP** | stdio (local process) | Firebase Admin SDK service account | Claude Code agents, local dev workflows |

The REST API is the canonical interface — the MCP server wraps the same backend services. Choose the REST API when your agent runs remotely or needs HTTP. Choose the MCP server when your agent is a Claude Code session with direct access to the project.

---

## API Key Management

### Creating a Key

**Via REST API** (requires an existing admin key):

```bash
curl -X POST https://europe-west1-marketintelligence-hub.cloudfunctions.net/api/auth/keys \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "researcher-agent-prod",
    "permissions": "read_write",
    "agent_identity": {
      "agent_id": "claude-researcher-01",
      "agent_name": "ITQ Research Agent",
      "agent_version": "1.0.0",
      "run_id": "bootstrap"
    }
  }'
```

The response returns the plaintext key (`rh_<64 hex chars>`). **Store it immediately** — it is never shown again. Only the SHA-256 hash is stored in Firestore.

**Via the portal UI**: Admin > API Keys > Create Key.

### Key Format

```
rh_<64 lowercase hex characters>
```

Example: `rh_a1b2c3d4e5f6...` (68 characters total).

### Permission Levels

| Permission | Read research | Write research | Manage keys |
|------------|:---:|:---:|:---:|
| `read` | Yes | -- | -- |
| `read_write` | Yes | Yes | -- |
| `admin` | Yes | Yes | Yes |

### Authentication Flow

1. Agent sends `Authorization: Bearer rh_...` header
2. Server computes `SHA-256(plaintext_key)`
3. Looks up the hash in `api-keys` collection (`key_hash` field, `is_active == true`)
4. Checks expiry date if set
5. Attaches `agent_identity` and `permissions` to the request

### Revoking a Key

```bash
curl -X DELETE https://europe-west1-marketintelligence-hub.cloudfunctions.net/api/auth/keys/$KEY_ID \
  -H "Authorization: Bearer $ADMIN_KEY"
```

---

## REST API Quick Reference

**Base URLs:**
- Production: `https://europe-west1-marketintelligence-hub.cloudfunctions.net/api`
- Staging: `https://europe-west1-marketintelligence-hub-staging.cloudfunctions.net/api`

**Auth header:** `Authorization: Bearer <api-key>`

For the full endpoint table, see [docs/api-reference.md](api-reference.md).

### Example: Create Research

```bash
curl -X POST $BASE_URL/research \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Netherlands Cloud Infrastructure Landscape 2025",
    "output_format": "competitive",
    "dimensions": {
      "market_ids": ["NL"],
      "domain_ids": ["cloud-infra"],
      "sector_ids": ["enterprise"]
    },
    "origin": "agent",
    "agent_identity": {
      "agent_id": "research-agent-01",
      "agent_name": "ITQ Research Agent",
      "agent_version": "2.1.0",
      "run_id": "run-20250612-001"
    }
  }'
```

### Example: Add a Source

```bash
curl -X POST $BASE_URL/research/$RESEARCH_ID/sources \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "notebook_id": "competitive",
    "title": "Gartner Magic Quadrant for Cloud Infrastructure 2025",
    "url": "https://example.com/report",
    "publisher": "Gartner",
    "publication_date": "2025-03-15",
    "quality_tier": 3,
    "discovered_by": "perplexity",
    "notes": "Key findings on Dutch market positioning"
  }'
```

### Example: Get Competitors (Intelligence)

```bash
curl "$BASE_URL/intelligence/competitors?region=NL&domain=cloud-infra" \
  -H "Authorization: Bearer $API_KEY"
```

### Example: Create Competitor

```bash
curl -X POST $BASE_URL/competitors \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Atos Cybersecurity",
    "type": "msp",
    "website": "https://atos.net",
    "headquarters_market_id": "NL",
    "employee_range": "1000-5000",
    "revenue_range": "100M-500M EUR",
    "description": "Major MSP competitor in Dutch security market"
  }'
```

### Example: Add Competitive Position

```bash
curl -X POST $BASE_URL/competitors/$COMPETITOR_ID/positions \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "market_id": "NL",
    "domain_id": "managed_services",
    "sector_ids": ["enterprise"],
    "services": ["Managed Detection & Response", "SOC-as-a-Service"],
    "packaging_model": "managed",
    "vendor_partnerships": ["Microsoft", "Palo Alto"],
    "strengths": "Strong local presence",
    "weaknesses": "Limited multi-cloud capabilities"
  }'
```

### Example: Add Timeline Event

```bash
curl -X POST $BASE_URL/competitors/$COMPETITOR_ID/events \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "service_launch",
    "title": "Launched MDR Service in Netherlands",
    "description": "Expanded managed detection and response to Dutch market",
    "date": "2026-01-15",
    "market_ids": ["NL"],
    "domain_ids": ["managed_services"],
    "source_url": "https://example.com/press-release"
  }'
```

---

## ResearchHub MCP Server

The MCP server (`src/mcp/server.ts`) runs as a local stdio process and connects to Firestore via the Firebase Admin SDK. It provides the same capabilities as the REST API without needing API keys.

### Configuration

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "researchhub": {
      "command": "cmd",
      "args": ["/c", "npx", "tsx", "src/mcp/server.ts"],
      "env": {
        "FIREBASE_ADMIN_SDK_PATH": "./path-to-service-account-key.json"
      }
    }
  }
}
```

On macOS/Linux, replace `"command": "cmd"` and `"args": ["/c", ...]` with `"command": "npx"` and `"args": ["tsx", "src/mcp/server.ts"]`.

### Tools (15)

#### Research CRUD

| Tool | Description | Key parameters |
|------|-------------|----------------|
| `search_research` | Search/filter research entries | `region`, `domain`, `sector`, `origin`, `min_trust_tier`, `status`, `limit`, `offset` |
| `get_research` | Get a single research entry by ID | `id` |
| `add_research` | Create a new research entry | `title`, `output_format`, `dimensions`, `agent_identity`, `findings?`, `synthesis?`, `input_context?` |
| `update_research` | Update fields on existing research | `id`, `title?`, `status?`, `findings?`, `synthesis?`, `review_status?` |

#### Sources & Files

| Tool | Description | Key parameters |
|------|-------------|----------------|
| `add_source` | Add a source to a notebook | `research_id`, `notebook_id`, `title`, `url`, `publisher`, `quality_tier`, `discovered_by` |
| `validate_source` | Record a validation event | `research_id`, `source_id`, `validation_status` (`corroborated`/`human_verified`/`disputed`), `validation_notes?` |
| `upload_file` | Upload file (base64) to research | `research_id`, `file_name`, `file_type`, `file_data`, `source_id?` |

#### Competitors

| Tool | Description | Key parameters |
|------|-------------|----------------|
| `create_competitor` | Create a competitor profile | `name`, `type`, `website?`, `headquarters_market_id?`, `employee_range?`, `description?` |
| `update_competitor` | Update competitor fields | `id`, `name?`, `type?`, `description?`, `website?`, `employee_range?`, `revenue_range?` |
| `add_competitor_position` | Add a competitive position | `competitor_id`, `market_id`, `domain_id`, `packaging_model`, `services?`, `strengths?`, `weaknesses?` |
| `add_competitor_event` | Add a timeline event | `competitor_id`, `event_type`, `title`, `date`, `description?`, `market_ids?`, `source_url?` |

#### Intelligence Queries

| Tool | Description | Key parameters |
|------|-------------|----------------|
| `get_competitors` | Competitors for a region | `region`, `domain?`, `sector?` |
| `get_landscape` | Full region x domain competitive matrix | `region` |
| `get_region_context` | Market summary: counts, domains, trust, updates | `region` |
| `get_research_brief` | Token-efficient markdown summary | `region`, `domain?` |

### Resources (4)

| Resource | URI | Content |
|----------|-----|---------|
| Markets taxonomy | `researchhub://taxonomy/markets` | Hierarchical market/region definitions |
| Domains taxonomy | `researchhub://taxonomy/domains` | Technology domains with default sources |
| Sectors taxonomy | `researchhub://taxonomy/sectors` | Industry verticals with regulations |
| Trust tier config | `researchhub://config/trust-tiers` | Tier 1-8 definitions and classifications |

### Example Tool Calls

**Search for published Dutch cloud research:**

```json
{
  "tool": "search_research",
  "arguments": {
    "region": "NL",
    "domain": "cloud-infra",
    "status": "published",
    "limit": 10
  }
}
```

**Add a source with tier 3 (analyst house):**

```json
{
  "tool": "add_source",
  "arguments": {
    "research_id": "abc123",
    "notebook_id": "competitive",
    "title": "Forrester Wave: European Cloud Providers",
    "url": "https://example.com/forrester-wave",
    "publisher": "Forrester",
    "quality_tier": 3,
    "discovered_by": "manual"
  }
}
```

---

## Agent Integration Guide

### Recommended Workflow

1. **Check existing research** (`search_research`) before creating duplicates
2. **Read taxonomy resources** to use correct dimension IDs
3. **Create research** (`add_research`) with `agent_identity` for provenance
4. **Add sources** (`add_source`) with appropriate trust tiers
5. **Validate sources** (`validate_source`) when cross-referencing
6. **Upload raw outputs** (`upload_file`) for audit trail
7. **Enrich competitors** — create profiles (`create_competitor`), add positions per market x domain (`add_competitor_position`), and log events like acquisitions or service launches (`add_competitor_event`)
8. **Set review status** (`update_research` with `review_status: "pending"`) for human sign-off

### Agent Identity

Every write operation tracks which agent performed it. Structure the `agent_identity` consistently:

```json
{
  "agent_id": "claude-researcher-nl",
  "agent_name": "ITQ Dutch Market Researcher",
  "agent_version": "1.2.0",
  "run_id": "run-20250612-abc123"
}
```

- `agent_id` — stable identifier across runs
- `agent_name` — human-readable label
- `agent_version` — semantic version of the agent's prompt/config
- `run_id` — unique per execution (use UUID or timestamp-based)

### Trust Tier System

Sources are classified on a 1-8 quality scale:

| Tier | Classification | Examples |
|------|---------------|----------|
| 1 | Authoritative | Government reports, EU regulations, CBS/Eurostat |
| 2 | Authoritative | Annual reports (KvK filings), academic journals |
| 3 | Established | Gartner, Forrester, IDC analyst reports |
| 4 | Established | Trade press (Computable, AG Connect) |
| 5 | Standard | Peer-reviewed industry research |
| 6 | Standard | AI-synthesized (Perplexity, NotebookLM, Claude) |
| 7 | Unverified | Vendor white papers, technical docs |
| 8 | Unverified | Vendor marketing, press releases, forum posts |

Validation events can adjust tiers:
- `corroborated` — tier improves by 1
- `human_verified` — tier improves by 2
- `disputed` — tier worsens by 2

### Human-in-the-Loop

Agent-created research defaults to `review_status: "pending"`. This signals that a human reviewer should check the entry before it is published. The admin review queue (`/admin/review-queue`) surfaces all pending entries.

Set `origin: "agent"` for fully automated entries, or `origin: "hybrid"` when a human directed the research but an agent executed it.

### Best Practices

1. **Always check before creating.** Use `search_research` with relevant filters. Duplicate entries fragment the knowledge base.

2. **Use `get_research_brief` for context injection.** It returns a token-efficient markdown summary — ideal for injecting existing knowledge into agent prompts without consuming the full research payload.

3. **Track input provenance with `input_context`.** List the IDs of research entries or context documents the agent used as input. This supports ISO 42001 traceability requirements.

4. **Upload raw outputs as files.** When an agent generates content via Perplexity, NotebookLM, or Claude, upload the raw markdown/PDF as a file attachment. This creates an audit trail separate from the processed findings.

5. **Cross-validate sources.** When multiple agents or tools produce overlapping findings, use `validate_source` with `corroborated` status to improve trust tiers.

6. **Respect the refresh lifecycle.** Check `next_refresh_date` and `refresh_schedule` before creating new research — it may be more appropriate to refresh an existing entry than to create a new one.

---

## Setting Up a New Agent

### Step 1: Create an API Key

Use the portal UI (Admin > API Keys) or the REST API (see above). Choose the minimum permission level needed:
- Research-only agents: `read`
- Agents that push findings: `read_write`
- Orchestrator agents managing other agents: `admin`

### Step 2: Configure Access

**For a REST API agent**, store the key as an environment variable:

```bash
export RESEARCHHUB_API_KEY="rh_your_key_here"
```

**For a Claude Code agent using MCP**, add the ResearchHub MCP server to the project's `.mcp.json`:

```json
{
  "mcpServers": {
    "researchhub": {
      "command": "npx",
      "args": ["tsx", "/path/to/ResearchHub/src/mcp/server.ts"],
      "env": {
        "FIREBASE_ADMIN_SDK_PATH": "/path/to/service-account-key.json"
      }
    }
  }
}
```

### Step 3: Agent System Prompt

Include context about available tools in the agent's system prompt. Example snippet:

```
You have access to the ITQ ResearchHub MCP server with these tools:
- search_research: Find existing research by region, domain, sector
- add_research: Create new research entries
- add_source: Add sources to research notebooks
- get_research_brief: Get token-efficient summaries
- get_competitors: Competitive analysis by region
- validate_source: Cross-validate sources
- create_competitor: Create competitor profiles
- add_competitor_position: Track positions per market x domain
- add_competitor_event: Log timeline events (acquisitions, launches, etc.)

Always check existing research before creating new entries.
Set review_status to "pending" for human review.
Use researchhub://taxonomy/* resources for valid dimension IDs.
```
