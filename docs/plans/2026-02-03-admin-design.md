# Admin Functionalities Design

**Date:** 2026-02-03
**Status:** Validated
**Scope:** System Configuration, Data Governance, Visibility & Oversight, Usage & Cost Tracking

---

## 1. Route Structure

Seven admin pages organized into three groups:

### Configuration

| Route | Purpose |
|-------|---------|
| `/admin/prompts` | Prompt Template Manager — edit base templates, AI tool profiles, assignments |
| `/admin/taxonomy` | Taxonomy management (existing) — markets, domains, sectors, tags |

### Governance

| Route | Purpose |
|-------|---------|
| `/admin/context-rules` | Context Library governance — classification rules, freshness policies |
| `/admin/users` | User management (existing) — roles, BU assignment |

### Oversight

| Route | Purpose |
|-------|---------|
| `/admin/coverage` | Coverage Matrix — market x domain heatmap |
| `/admin/activity` | Activity Log — audit trail of all system events |
| `/admin/usage` | Usage & Cost Tracking — token consumption, cost attribution per BU |

### Navigation

The admin sidebar section expands from two items to three groups with clear headers. The coverage matrix is the daily-driver view and should be the default admin landing.

---

## 2. Prompt Template Manager

The Prompt Template Manager lives at `/admin/prompts` with three tabs.

### Tab 1: Base Templates

Each template corresponds to one research step (Discovery, Analysis, Synthesis) and one domain. Templates use `{{variable}}` interpolation for dynamic values like market name, sector, and source list.

**Key features:**

- **Template editor** with syntax highlighting for `{{variables}}`
- **Version history** — every save creates a new version with timestamp, author, and diff preview
- **Rollback** — one-click restore to any previous version
- **Preview pane** — render template with sample data to verify output before saving
- **Default templates** — system ships with working defaults for every domain x step combination

**Template structure:**

```
{
  id, domain, researchStep, version,
  content (template body with {{variables}}),
  variables (list of available interpolation keys),
  createdBy, createdAt, isActive
}
```

### Tab 2: AI Tool Profiles

A registry of AI tools (Perplexity, Claude, NotebookLM, and future additions) with configuration per tool.

**Each profile contains:**

- **Tool metadata** — name, description, icon, status (active/inactive)
- **Wrapper template** — prefix and suffix text that wraps around any base prompt when sent to this tool (e.g., Perplexity gets "Search the web for..." prefix, NotebookLM gets "Using only the provided sources..." prefix)
- **Pricing config** — cost per 1K input tokens, cost per 1K output tokens (for cost tracking)
- **Recommended steps** — which research steps this tool is best suited for (informational, does not restrict usage)
- **Default status** — whether this tool is the default for any unassigned step

**Defaults-first philosophy:** Every AI tool works out of the box using the base prompt + its wrapper. No per-tool prompt customization is required unless the admin explicitly wants to tune behavior.

### Tab 3: Prompt Assignments

A matrix view mapping **Domain x Research Step → AI Tool**, with the ability to override the base prompt per combination.

**Assignment matrix display:**

|  | Discovery | Analysis | Synthesis |
|--|-----------|----------|-----------|
| Technology | Perplexity | Claude | Claude |
| Finance | Perplexity | Claude | Claude |
| Healthcare | Perplexity | Claude | NotebookLM |

**Each cell allows:**

- Select which AI tool to use (dropdown)
- Optionally override the base prompt with a tool-specific version
- Clear override to fall back to default

### Prompt Resolution (Fallback Chain)

When generating a prompt for a given domain + research step + AI tool:

1. **Tool + Domain override** — if a specific prompt exists for this tool + domain + step, use it
2. **Domain override** — if a domain-specific base template exists, use it + apply the tool's wrapper
3. **Default + tool wrapper** — use the default base template + apply the tool's wrapper prefix/suffix
4. **Default only** — use the default base template with no wrapper

This ensures everything works out of the box while allowing progressive customization.

---

## 3. Context Library Rules

The Context Library Rules page at `/admin/context-rules` has two sections.

### Section 1: Classification Rules

Rules that define what metadata is required per document category at upload time. These enforce data quality without requiring approval workflows.

**Per category (e.g., "Market Report", "Regulation", "Internal Strategy"):**

- **Required fields** — which metadata fields must be filled (e.g., market reports require at least one market + one domain)
- **Suggested tags** — auto-suggested tags based on category
- **File type restrictions** — allowed MIME types per category (e.g., regulations must be PDF)
- **Max file size** — per-category size limits

**UI:** A table of categories, each expandable to show/edit its rules. An "Add Category" button at the top for new document types.

### Section 2: Freshness Policies

Automated rules that flag or archive stale documents.

**Per category:**

- **Max age** — how old a document can be before it's flagged (e.g., market reports: 6 months)
- **Grace period** — time after flagging before auto-archive (e.g., 30 days)
- **Action on expiry** — flag only, archive, or notify owner
- **Notification** — who gets notified (uploader, admins, both)

**UI:** A table of categories with age/grace columns, inline-editable. A "Stale Documents" preview panel at the bottom shows how many documents would be affected by current rules.

**Enforcement:** A scheduled function (or on-read check) compares document `createdAt` / `lastValidatedAt` against the freshness policy and updates a `freshnessStatus` field: `fresh`, `stale`, `archived`.

---

## 4. Coverage Matrix

The Coverage Matrix at `/admin/coverage` is a heatmap showing research coverage across Market x Domain.

### Display

A grid where rows are markets (grouped by region) and columns are domains. Each cell is color-coded:

| Color | Meaning |
|-------|---------|
| Green | Fresh research exists (published within refresh window) |
| Yellow | Research exists but approaching staleness |
| Red | No research or expired |
| Blue | Research in progress (draft/in_review status) |

### Interactions

- **Hover** — tooltip showing: count of research items, newest publication date, next refresh date
- **Click** — drill down to filtered research list for that market + domain
- **Filter bar** — filter by sector to see sector-specific coverage overlay
- **Summary row/column** — totals showing coverage percentage per market and per domain

### Data Source

Computed from the `research` collection by grouping on `marketIds` x `domainIds` and comparing `publishedAt` against the domain's `refreshSchedule` (from constants or taxonomy).

This is the daily-driver admin view — the page admins check every morning to understand where research gaps exist.

---

## 5. Activity Log & Health Metrics

### Activity Log (`/admin/activity`)

An event-sourced audit trail of all significant system events.

**Event structure:**

```
{
  id, timestamp, actor (userId + displayName),
  action (created | updated | deleted | published | archived | ...),
  targetType (research | context_document | prompt_template | user | ...),
  targetId, targetName,
  details (JSON — what changed),
  category (research | admin | auth | system)
}
```

**UI features:**

- Reverse-chronological feed with infinite scroll
- Filter by: category, actor, action type, date range
- Search by target name or actor
- Expandable rows showing full change details (diff view for edits)

### Health Metrics (embedded in Activity page)

A summary bar at the top of the activity page with key health indicators:

| Metric | Description |
|--------|-------------|
| Active research | Count of research in draft/in_review/published states |
| Stale documents | Count of context documents past freshness threshold |
| Coverage score | Percentage of market x domain cells with fresh research |
| Weekly activity | Research items created/updated in the last 7 days |

These metrics are computed on-read from existing collections (no separate metrics collection needed for MVP).

### Priority

1. **Coverage Matrix** — daily driver, check every morning
2. **Activity Log** — review periodically, useful for audits
3. **Health Metrics** — summary bar, quick pulse check
4. **Pipeline View** — future enhancement (Kanban board of research by status)

---

## 6. Data Model

### New Firestore Collections

#### `prompt_templates`

```typescript
interface PromptTemplate {
  id: string;
  domain: string;           // domain ID or "_default"
  researchStep: string;     // "discovery" | "analysis" | "synthesis"
  aiTool: string | null;    // tool ID for override, null for base template
  version: number;
  content: string;          // template body with {{variables}}
  variables: string[];      // available interpolation keys
  isActive: boolean;
  createdBy: string;
  createdAt: Timestamp;
  previousVersionId: string | null;
}
```

#### `ai_tool_profiles`

```typescript
interface AIToolProfile {
  id: string;
  name: string;             // "Perplexity", "Claude", "NotebookLM"
  description: string;
  icon: string;             // icon identifier
  status: "active" | "inactive";
  wrapperPrefix: string;    // prepended to base prompt
  wrapperSuffix: string;    // appended to base prompt
  pricingConfig: {
    inputCostPer1kTokens: number;
    outputCostPer1kTokens: number;
    currency: string;       // "EUR"
  };
  recommendedSteps: string[];  // informational
  isDefault: boolean;       // default tool when no assignment exists
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `prompt_assignments`

```typescript
interface PromptAssignment {
  id: string;               // "{domain}_{researchStep}"
  domain: string;
  researchStep: string;
  aiToolId: string;         // assigned AI tool
  overrideTemplateId: string | null;  // custom prompt, or null for fallback
  updatedBy: string;
  updatedAt: Timestamp;
}
```

#### `context_rules`

```typescript
interface ContextRule {
  id: string;
  category: string;         // document category name
  requiredFields: string[]; // metadata fields required at upload
  suggestedTags: string[];
  allowedFileTypes: string[];  // MIME types
  maxFileSizeMb: number;
  freshnessPolicy: {
    maxAgeDays: number;
    gracePeriodDays: number;
    action: "flag" | "archive" | "notify";
    notifyTargets: ("uploader" | "admins")[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `activity_log`

```typescript
interface ActivityLogEntry {
  id: string;
  timestamp: Timestamp;
  actor: {
    userId: string;
    displayName: string;
  };
  action: "created" | "updated" | "deleted" | "published" | "archived" | "login" | "role_changed";
  targetType: "research" | "context_document" | "prompt_template" | "ai_tool_profile" | "user" | "taxonomy";
  targetId: string;
  targetName: string;
  details: Record<string, unknown>;  // what changed
  category: "research" | "admin" | "auth" | "system";
}
```

#### `api_usage_log`

```typescript
interface ApiUsageEntry {
  id: string;
  timestamp: Timestamp;
  userId: string;
  userDisplayName: string;
  businessUnit: string;      // from user profile
  aiToolId: string;
  researchId: string | null; // linked research, if applicable
  researchStep: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;     // computed from tool's pricing config
  currency: string;          // "EUR"
  metadata: Record<string, unknown>;
}
```

### Collection Upgrades

#### `users` (existing, add fields)

```typescript
// Add to existing user profile:
{
  businessUnit: string;     // for cost attribution
  monthlyTokenBudget?: number;  // optional soft limit
}
```

---

## 7. Usage & Cost Tracking

The Usage & Cost Tracking page at `/admin/usage` provides visibility into API consumption and cost attribution.

### How It Works

1. **Logging** — every API call to an AI tool logs an entry to `api_usage_log` with token counts, the user who triggered it, and their business unit
2. **Cost estimation** — each entry's cost is computed at write time using the AI tool's `pricingConfig` (from `ai_tool_profiles`)
3. **Attribution** — costs roll up to the user's `businessUnit` field for internal billing

### Dashboard Views

**Summary cards (top row):**

- Total cost this month (EUR)
- Total tokens consumed
- Cost by AI tool (bar chart)
- Top 5 users by consumption

**Breakdowns (tabs or toggles):**

- **By Business Unit** — table showing BU name, total tokens, total cost, number of API calls, with month-over-month comparison
- **By AI Tool** — cost per tool with trend line
- **By User** — individual user consumption (filterable by BU and date range)
- **By Research** — cost attributed to specific research items

### Export

- **CSV export** button on each breakdown view for internal billing workflows
- Columns: date, user, BU, AI tool, research ID, input tokens, output tokens, cost

### Budget Alerts (Future Enhancement)

Optional per-BU or per-user monthly token budgets with notification when approaching thresholds (80%, 100%).

---

## Implementation Priority

| Phase | Pages | Rationale |
|-------|-------|-----------|
| 1 | Coverage Matrix, Prompt Template Manager | Daily-use tools, core admin value |
| 2 | Context Rules, Usage & Cost Tracking | Governance and cost visibility |
| 3 | Activity Log, Health Metrics | Audit and monitoring |
| 4 | Pipeline View (future) | Nice-to-have Kanban board |

---

## Key Design Decisions

1. **Defaults-first** — everything works out of the box; customization is opt-in
2. **Fallback chain** — 4-level prompt resolution ensures no configuration gaps
3. **No approval workflows (MVP)** — classification rules enforce quality at upload time
4. **On-read metrics** — health metrics computed from existing collections, no separate aggregation needed
5. **Event-sourced activity** — write-only log, simple to implement, powerful for audits
6. **BU-level cost attribution** — users tagged with business unit, costs roll up automatically
7. **Coverage matrix as daily driver** — the view admins check every morning
