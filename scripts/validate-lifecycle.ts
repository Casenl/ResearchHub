/**
 * Lifecycle validation / smoke test for the ResearchHub REST API.
 *
 * Exercises the full trust-tier lifecycle end-to-end:
 *   Create Research -> Add Source -> Validate Source -> Query -> Landscape -> Archive
 *
 * Usage:
 *   API_URL=https://... API_KEY=rh_xxx npx tsx scripts/validate-lifecycle.ts
 */

export {};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

if (!API_URL || !API_KEY) {
  console.error('Missing required env vars: API_URL and API_KEY');
  process.exit(1);
}

const BASE = API_URL.replace(/\/+$/, '');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ApiResponse {
  status: number;
  data: Record<string, unknown>;
}

async function request(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: Record<string, unknown>,
): Promise<ApiResponse> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text);
  } catch {
    data = { _raw: text };
  }

  if (!res.ok) {
    const msg = (data.error as string) ?? `HTTP ${res.status}`;
    throw new Error(`${method} ${path} -> ${res.status}: ${msg}`);
  }

  return { status: res.status, data };
}

let passed = 0;
let failed = 0;

function pass(label: string, detail = ''): void {
  passed++;
  console.log(`[PASS] ${label}${detail ? ` (${detail})` : ''}`);
}

function fail(label: string, reason: string): void {
  failed++;
  console.log(`[FAIL] ${label}: ${reason}`);
}

// ---------------------------------------------------------------------------
// Test constants
// ---------------------------------------------------------------------------

const NOTEBOOK_ID = 'nb-lifecycle-test';
const MARKET_ID = 'market-nl';
const REGION = 'NL';

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

async function run(): Promise<void> {
  console.log('\n--- ResearchHub Lifecycle Validation ---\n');
  console.log(`Target: ${BASE}\n`);

  let researchId = '';
  let sourceId = '';
  let originalTier = 0;

  // Step 1 — Create Research
  try {
    const { data } = await request('POST', '/research', {
      title: 'Lifecycle Validation Test',
      description: 'Automated smoke test — safe to delete',
      output_format: 'factsheet',
      type: 'new',
      origin: 'agent',
      agent_identity: {
        agent_id: 'lifecycle-validator',
        agent_name: 'validate-lifecycle.ts',
        agent_version: '1.0.0',
        run_id: `run-${Date.now()}`,
      },
      dimensions: {
        market_ids: [MARKET_ID],
        domain_ids: [],
        sector_ids: [],
      },
    });

    researchId = data.id as string;
    const status = data.status as string;
    const reviewStatus = data.review_status as string;

    if (!researchId) throw new Error('No id in response');
    if (status !== 'draft') throw new Error(`expected status draft, got ${status}`);
    if (reviewStatus !== 'pending') throw new Error(`expected review_status pending, got ${reviewStatus}`);

    pass('Step 1 -- Create Research', `id: ${researchId}`);
  } catch (err) {
    fail('Step 1 -- Create Research', (err as Error).message);
    console.log('\nAborting: cannot continue without a research ID.\n');
    return;
  }

  // Step 1.5 — Seed a notebook so sources can be attached
  // The API creates research with notebooks: []. We inject one via PATCH on
  // the research document so the source POST has a valid notebook_id target.
  try {
    await request('PATCH', `/research/${researchId}`, {
      // The UpdateResearchSchema may strip unknown fields; if so this step
      // will succeed but the notebook won't persist, and Step 2 will 404.
      notebooks: [{ id: NOTEBOOK_ID, type: 'market_regulation', sources: [], findings: '' }],
    } as Record<string, unknown>);
    pass('Step 1.5 -- Seed notebook', `notebook_id: ${NOTEBOOK_ID}`);
  } catch (err) {
    // Non-fatal: log and continue (Step 2 will surface the real failure)
    console.log(`[INFO] Step 1.5 -- Seed notebook skipped: ${(err as Error).message}`);
  }

  // Step 2 — Add a Source
  try {
    const { data } = await request('POST', `/research/${researchId}/sources`, {
      notebook_id: NOTEBOOK_ID,
      title: 'Test Source - Lifecycle Validation',
      url: 'https://example.com/test-source',
      publisher: 'Test Publisher',
      publication_date: '2026-02-01',
      quality_tier: 6,
      discovered_by: 'perplexity',
      notes: 'Automated lifecycle test',
    });

    sourceId = data.id as string;
    const valStatus = data.validation_status as string;
    const tier = data.quality_tier as number;

    if (!sourceId) throw new Error('No source id in response');
    if (valStatus !== 'unverified') throw new Error(`expected validation_status unverified, got ${valStatus}`);
    if (tier < 5 || tier > 6) throw new Error(`expected quality_tier 5-6, got ${tier}`);

    originalTier = tier;
    pass('Step 2 -- Add Source', `source_id: ${sourceId}, tier: ${tier}`);
  } catch (err) {
    fail('Step 2 -- Add Source', (err as Error).message);
    sourceId = '';
  }

  // Step 3 — Validate Source (corroborate)
  if (sourceId) {
    try {
      const { data } = await request('POST', `/research/${researchId}/sources/${sourceId}/validate`, {
        validation_status: 'corroborated',
        validation_notes: 'Confirmed by secondary source during lifecycle test',
      });

      const newTier = data.new_tier as number;
      const newStatus = data.new_status as string;

      if (newTier >= originalTier) throw new Error(`expected tier < ${originalTier}, got ${newTier}`);
      if (newStatus !== 'corroborated') throw new Error(`expected status corroborated, got ${newStatus}`);

      pass('Step 3 -- Validate Source', `tier: ${originalTier} -> ${newTier}, status: ${newStatus}`);
    } catch (err) {
      fail('Step 3 -- Validate Source', (err as Error).message);
    }
  } else {
    fail('Step 3 -- Validate Source', 'skipped (no source created in Step 2)');
  }

  // Step 4 — Query Research
  try {
    const { data } = await request('GET', `/research?region=${MARKET_ID}`);
    const results = data.results as Array<Record<string, unknown>>;
    const found = results?.some((r) => r.id === researchId);

    if (!found) throw new Error(`research ${researchId} not found in query results`);

    pass('Step 4 -- Query Research', `total: ${data.total}, found target: true`);
  } catch (err) {
    fail('Step 4 -- Query Research', (err as Error).message);
  }

  // Step 5 — Get Landscape
  try {
    const { data } = await request('GET', `/intelligence/landscape?region=${REGION}`);
    // Landscape may be empty if dimensions don't match the code-based filter;
    // we just verify the endpoint returns a valid shape.
    const landscape = data.landscape;
    if (!Array.isArray(landscape)) throw new Error('expected landscape array');

    pass('Step 5 -- Get Landscape', `entries: ${(landscape as unknown[]).length}`);
  } catch (err) {
    fail('Step 5 -- Get Landscape', (err as Error).message);
  }

  // Step 6 — Archive Research (cleanup)
  try {
    await request('DELETE', `/research/${researchId}`);
    pass('Step 6 -- Archive Research', `id: ${researchId}`);
  } catch (err) {
    fail('Step 6 -- Archive Research', (err as Error).message);
  }

  // Summary
  const total = passed + failed;
  console.log(`\n--- Results: ${passed}/${total} passed, ${failed} failed ---\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
