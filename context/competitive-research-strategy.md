# Cross-Regional Competitive Research Strategy

**Date:** 2026-02-11
**Status:** Draft — for use in a future project to implement these changes

---

## Problem Statement

ITQ operates across multiple regions (NL, BE, FR, DE, LU, expanding to Nordics) with five service lines (Hybrid Cloud, Cloud Native, Digital Workspace, Managed Services, Licensing Advisory). The current virtual agent team produces competitive research per proposition pipeline, but lacks:

1. **No region x competitor matrix** — cannot see "who competes with us in Belgium vs. Germany vs. Nordics"
2. **No regional market dynamics** — partner ecosystems, procurement norms, and regulatory pressure vary by country
3. **Research not reusable across propositions** — intelligence discovered during one project doesn't automatically feed into others (e.g., Arctic Wolf expanding in DE found during Cyber Resilience doesn't reach Hybrid Cloud pipeline)

---

## Current State

### How competitive research works today

| Step | Agent | What happens |
|------|-------|-------------|
| 1 | Product Manager | Creates VPC with competitive positioning (top 3 competitors per service line) |
| 2 | Architect | References `itq-competitors.md` for competitor technology stacks |
| 3 | CTO | Reviews competitive threats, flags research priorities for downstream |
| 4 | Sales Enablement | Creates per-competitor battle cards using `itq-competitors.md` + CTO instructions |
| 5 | Researcher | Conducts real-time research via Perplexity; compares against skill file baseline; flags changes |

### Current skill file structure

- `itq-competitors.md` — Flat table of 15+ competitors. HQ noted but no structured regional breakdown. Battle cards for top 3 only.
- `itq-market-intelligence.md` — Tagged by proposition but not systematically by region x competitor.
- `itq-regulations.md` — Has per-country NIS2 transposition status but not linked to competitive dynamics.

### Key limitation

The Researcher agent treats `itq-competitors.md` as a baseline and researches what changed since. But the baseline itself has no regional depth — it's Netherlands-centric with occasional mentions of other markets.

---

## Recommended Changes

### Change 1: Restructure `itq-competitors.md` to be region-aware

Add a **Regional Presence** section per competitor profile:

```markdown
## PQR (Bechtle Group)
...existing fields...

### Regional Presence
| Region | Active | Partner Tier | Vertical Focus | Notable Wins | Threat Level |
|--------|--------|-------------|----------------|--------------|--------------|
| NL     | Yes    | Pinnacle    | Gov, Healthcare| Gemeente X   | High         |
| BE     | Yes    | Pinnacle    | Healthcare     | -            | Medium       |
| DE     | Via Bechtle | -       | Enterprise     | -            | Low (indirect) |
| FR     | No     | -           | -              | -            | None         |
```

Add a **Regional Competitive Landscape** summary matrix at the end of the file:

```markdown
## Regional Competitive Landscape

| Region | Hybrid Cloud | Digital Workspace | Cloud Native | Managed Services | Cyber Resilience |
|--------|-------------|-------------------|--------------|-----------------|------------------|
| NL     | PQR, SLTN, Computacenter | PQR, SLTN | Nordcloud, Sentia | SLTN, Open Line | Arctic Wolf, Eye Security, ON2IT |
| BE     | Axians, Computacenter | Axians | Sentia | Open Line (Conscia) | Eye Security |
| DE     | Computacenter, Atos | Computacenter | Nordcloud | Atos | Arctic Wolf |
| FR     | Axians, Atos | - | - | Axians | - |
| LU     | - | - | - | - | - |
| Nordics| Nordcloud, Proact | - | Nordcloud | Proact | Arctic Wolf |
```

### Change 2: Create a new `itq-regions.md` skill file

A dedicated knowledge file containing per-region context that all agents need:

```markdown
# ITQ Regional Market Intelligence

## Netherlands (NL)
### Market Characteristics
- Size: [EUR X B IT services market]
- Maturity: High — established VMware/hybrid cloud market
- Procurement culture: Relationship-driven for mid-market, tender-driven for government
- Language: Dutch (English accepted in enterprise/tech)

### ITQ Presence
- HQ: Ede
- Headcount: [N]
- Local partnerships: [list]

### Regulatory Environment
- NIS2: Cyberbeveiligingswet pending, pushed to H2 2026
- DORA: DNB/AFM supervision active
- Healthcare: NEN 7510 (clients achieve on ITQ platforms)
- Government: BIO framework

### Key Verticals
- Government (Gemeente Haarlem, CBS, UWV, Gemeente Amstelveen)
- Healthcare (St. Jansdal, NKI/AVL)
- Enterprise (CM.com, Login VSI)

### Go-to-Market
- Direct + partner channel
- Strong existing customer base for cross-sell
- Mid-market sweet spot

## Belgium (BE)
### Market Characteristics
- Size: [EUR X B]
- Maturity: Medium — growing hybrid cloud adoption
- Procurement culture: [description]
- Language: Dutch (Flanders) / French (Wallonia)

### ITQ Presence
- Office: [location]
- Headcount: [N]

### Regulatory Environment
- NIS2: In force since April 2025 (early mover)
- Implication: Belgian clients already under compliance pressure — competitive advantage for ITQ if positioned correctly

### Key Verticals
- Healthcare
- [others]

### Go-to-Market
- [direct/channel mix]
- NIS2 urgency creates demand pull

## Germany (DE)
[same structure]

## France (FR)
[same structure]

## Luxembourg (LU)
[same structure]

## Nordics (expansion target)
[same structure — lighter on detail, heavier on market entry considerations]
```

This file becomes a dependency for the Researcher, Sales Enablement, and Marketeer agents.

### Change 3: Add a standalone Competitive Landscape Sweep workflow

Currently, competitive intel only appears as a by-product of proposition pipelines (step 06). Add a periodic, standalone research workflow that covers the full region x proposition matrix.

#### Option A: Manual orchestration (simplest)

Run the Researcher agent in utility mode once per region:

```
/agent researcher "Conduct competitive landscape update for region: {NL}.
For each competitor active in this region, research:
- Recent wins/losses
- Funding, M&A activity
- New partnerships or certifications
- Pricing changes
- Positioning shifts
- New service launches
Cross-reference with itq-competitors.md baseline.
Output to output/competitive-intel/{region}-{date}.md"
```

Repeat for BE, DE, FR, LU, Nordics. Then manually consolidate.

**Pros:** No agent changes needed, works today.
**Cons:** Sequential, no automatic consolidation, no skill file updates.

#### Option B: Parallel agent sweep (recommended)

Use a team of Researcher agents running in parallel, one per region, with a consolidation step:

```
Region researchers (parallel):  NL | BE | DE | FR | LU | Nordics
                                         |
                                    Consolidator (sequential)
                                         |
                         output/competitive-intel/landscape-{date}.md
                         + itq-competitors.md updates (regional presence)
                         + itq-regions.md updates (market dynamics)
                         + Notion Market Intelligence DB sync
```

**Implementation steps:**
1. Create a "Competitive Intelligence Lead" agent (or extend the existing Researcher) that orchestrates the sweep
2. It spawns parallel sub-researchers per region using Claude Code teams
3. Each sub-researcher outputs to `output/competitive-intel/{region}-{date}.md`
4. The lead consolidates into a single cross-regional report
5. The lead proposes updates to `itq-competitors.md` and `itq-regions.md`
6. Updates are synced to Notion via the existing sync procedure (see REFERENCE.md)

**Pros:** Parallel execution, automatic consolidation, skill file feedback loop.
**Cons:** Requires new agent definition or orchestration logic.

#### Option C: Region x Proposition matrix (most thorough)

Run researchers per cell: `{region} x {proposition}`. For 6 regions and 5 propositions, that's 30 cells. Pre-filter to active combinations only.

**Pros:** Maximum granularity, proposition-specific competitive insights per region.
**Cons:** Expensive (30 research runs), many cells will be sparse. Better suited for a later stage when ITQ is active in all regions across all service lines.

---

## Implementation Roadmap

### Phase 1: Foundation (do first)

1. **Create `itq-regions.md`** — Populate with known regional data from existing skill files, Notion, and team knowledge. Start with NL and BE (most data available), then DE, FR, LU, Nordics.
2. **Restructure `itq-competitors.md`** — Add Regional Presence tables per competitor. Add the Regional Competitive Landscape summary matrix. This is additive — no existing data is lost.
3. **Update agent references** — Ensure the Researcher, Sales Enablement, and Marketeer agents read `itq-regions.md` in their context.

### Phase 2: Workflow (do second)

4. **Run a manual sweep (Option A)** — Execute one round of region-by-region research to validate the approach and populate the new regional data structures.
5. **Review and refine** — Check output quality. Adjust the Researcher prompt based on what works and what doesn't.

### Phase 3: Automation (do when ready)

6. **Build the parallel sweep (Option B)** — Create orchestration logic (either as a new agent or a skill/script) for periodic competitive landscape sweeps.
7. **Establish cadence** — Run quarterly or on-demand before major go-to-market decisions.
8. **Add Notion sync** — Ensure sweep outputs feed back into the Market Intelligence DB with proper region and proposition tags.

---

## Agent Changes Required

| Agent | Change | Priority |
|-------|--------|----------|
| Researcher | Add `itq-regions.md` to context. Update prompt to check regional presence when researching competitors. | High |
| Sales Enablement | Add `itq-regions.md` to context. Create region-specific battle cards when CTO specifies a target region. | Medium |
| Marketeer | Add `itq-regions.md` to context. Adapt campaign plans for regional differences (language, regulatory urgency, channel mix). | Medium |
| Product Manager | Reference `itq-regions.md` when building VPC to segment customer profiles by region. | Low |
| New: CI Lead (optional) | Orchestrates parallel competitive sweeps. Consolidates regional outputs. Proposes skill file updates. | Phase 3 |

---

## Success Criteria

- [ ] Can answer "Who are our top 3 competitors in Belgium for Managed Services?" from skill files alone (no research needed)
- [ ] Researcher agent produces region-tagged competitive intelligence that is reusable across proposition pipelines
- [ ] Quarterly competitive landscape report covers all active regions
- [ ] Skill files (`itq-competitors.md`, `itq-regions.md`) stay current through a feedback loop from research outputs
- [ ] New proposition pipelines start with fresher, region-aware competitive baselines
