/**
 * Competitive Sweep CLI — hits the ResearchHub REST API to create
 * competitive intelligence research entries for each region + domain pair.
 *
 * Usage:
 *   API_URL=https://api-xxx.run.app API_KEY=rh_xxx npx tsx scripts/competitive-sweep.ts
 *
 * Environment variables:
 *   API_URL  — base URL of the Cloud Functions API (required)
 *   API_KEY  — agent API key, prefixed rh_ (required)
 *   REGIONS  — comma-separated region codes (default: NL,BE,DE,UK,US)
 *   DOMAINS  — comma-separated domain codes (default: managed_services,data_analytics,cloud_platform)
 */

export {};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LandscapeEntry {
  id: string;
  updated_at: string;
  [key: string]: unknown;
}

interface LandscapeResponse {
  data: LandscapeEntry[];
}

interface CreateResearchResponse {
  id: string;
  [key: string]: unknown;
}

interface SweepResult {
  region: string;
  domain: string;
  status: "created" | "skipped" | "error";
  researchId: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;
const REGIONS = (process.env.REGIONS ?? "NL,BE,DE,UK,US").split(",").map((s) => s.trim());
const DOMAINS = (process.env.DOMAINS ?? "managed_services,data_analytics,cloud_platform").split(",").map((s) => s.trim());

const STALE_DAYS = 30;

if (!API_URL || !API_KEY) {
  console.error("Missing required env vars: API_URL and API_KEY must be set.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function headers(): Record<string, string> {
  return {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };
}

function isRecent(isoDate: string): boolean {
  const cutoff = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
  return new Date(isoDate).getTime() > cutoff;
}

function monthLabel(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

async function fetchLandscape(region: string): Promise<LandscapeEntry[]> {
  const url = `${API_URL}/intelligence/landscape?region=${encodeURIComponent(region)}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    throw new Error(`GET ${url} returned ${res.status}: ${await res.text()}`);
  }
  const body = (await res.json()) as LandscapeResponse;
  return body.data ?? [];
}

async function createResearch(region: string, domain: string): Promise<string> {
  const url = `${API_URL}/research`;
  const body = {
    title: `${region} ${domain} Competitive Update - ${monthLabel()}`,
    description: `Automated competitive intelligence sweep for ${region} ${domain}`,
    type: "competitive_update",
    output_format: "report",
    origin: "agent",
    agent_identity: {
      agent_id: "github-actions-sweep",
      agent_name: "Scheduled Competitive Sweep",
      agent_version: "1.0.0",
      run_id: process.env.GITHUB_RUN_ID ?? "manual",
    },
    synthesis: "",
    assumptions: ["Automated sweep -- sources need human verification"],
    refresh_schedule: "weekly",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`POST ${url} returned ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as CreateResearchResponse;
  return data.id;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log(`Competitive sweep starting — ${REGIONS.length} regions x ${DOMAINS.length} domains`);
  console.log(`API: ${API_URL}\n`);

  const results: SweepResult[] = [];
  let hasError = false;

  for (const region of REGIONS) {
    let landscape: LandscapeEntry[] = [];
    try {
      landscape = await fetchLandscape(region);
    } catch (error) {
      console.error(`Failed to fetch landscape for ${region}:`, error);
    }

    for (const domain of DOMAINS) {
      try {
        const recent = landscape.find(
          (entry) =>
            String(entry.domain ?? "").toLowerCase() === domain.toLowerCase() &&
            entry.updated_at &&
            isRecent(entry.updated_at),
        );

        if (recent) {
          console.log(`SKIP  ${region}/${domain} — recent entry ${recent.id}`);
          results.push({
            region,
            domain,
            status: "skipped",
            researchId: recent.id,
            message: `Recent entry exists (updated ${recent.updated_at})`,
          });
          continue;
        }

        const id = await createResearch(region, domain);
        console.log(`NEW   ${region}/${domain} — created ${id}`);
        results.push({
          region,
          domain,
          status: "created",
          researchId: id,
          message: "Created",
        });
      } catch (error) {
        hasError = true;
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`ERROR ${region}/${domain} — ${msg}`);
        results.push({
          region,
          domain,
          status: "error",
          researchId: "-",
          message: msg,
        });
      }
    }
  }

  // Summary table
  console.log("\n## Sweep Summary\n");
  console.log("| Region | Domain | Status | Research ID | Action |");
  console.log("|--------|--------|--------|-------------|--------|");
  for (const r of results) {
    console.log(`| ${r.region} | ${r.domain} | ${r.status} | ${r.researchId} | ${r.message} |`);
  }

  const created = results.filter((r) => r.status === "created").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const errors = results.filter((r) => r.status === "error").length;
  console.log(`\nTotals: ${created} created, ${skipped} skipped, ${errors} errors`);

  if (hasError) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Sweep failed:", err);
  process.exit(1);
});
