import { Router, Response } from 'express';
import { db } from '../lib/admin';
import { AuthenticatedRequest, requirePermission } from '../middleware/auth';

export const intelligenceRouter = Router();

const anyRead = requirePermission('read', 'read_write', 'admin');

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------
interface DimEntry { id: string; name: string; code: string }
interface SourceEntry { id: string; title: string; quality_tier: number }
interface NotebookEntry { id: string; type: string; sources: SourceEntry[]; findings: string }

interface ResearchDoc {
  id: string; title: string; description: string; status: string;
  origin: string; synthesis: string; updated_at: string;
  dimensions: { markets: DimEntry[]; domains: DimEntry[]; sectors: DimEntry[] };
  notebooks: NotebookEntry[];
}

/** Collect all sources across notebooks. */
function allSources(r: ResearchDoc): SourceEntry[] {
  return (r.notebooks ?? []).flatMap((nb) => nb.sources ?? []);
}

/** Average quality tier across sources, default 5 when none exist. */
function avgTrustTier(sources: SourceEntry[]): number {
  if (sources.length === 0) return 5;
  return Math.round(sources.reduce((s, src) => s + (src.quality_tier ?? 5), 0) / sources.length);
}

/** Fetch non-archived research filtered by region, with optional domain/sector. */
async function fetchResearch(region: string, domain?: string, sector?: string): Promise<ResearchDoc[]> {
  const snapshot = await db().collection('research').where('status', '!=', 'archived').get();
  let items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ResearchDoc));
  items = items.filter((r) => r.dimensions?.markets?.some((m) => m.code === region || m.id === region));
  if (domain) items = items.filter((r) => r.dimensions?.domains?.some((d) => d.code === domain || d.id === domain));
  if (sector) items = items.filter((r) => r.dimensions?.sectors?.some((s) => s.code === sector || s.id === sector));
  return items;
}

/** Validate that region query param exists; returns the value or sends 400. */
function requireRegion(req: AuthenticatedRequest, res: Response): string | null {
  const region = req.query.region as string | undefined;
  if (!region) { res.status(400).json({ error: 'Query parameter "region" is required' }); return null; }
  return region;
}

// ---------------------------------------------------------------------------
// GET /competitors
// ---------------------------------------------------------------------------
intelligenceRouter.get('/competitors', anyRead, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const region = requireRegion(req, res); if (!region) return;
    const items = await fetchResearch(region, req.query.domain as string, req.query.sector as string);

    const competitors = items.map((r) => {
      const src = allSources(r);
      return {
        name: r.title,
        region,
        domain: r.dimensions.domains?.[0]?.code ?? 'unknown',
        trust_tier: avgTrustTier(src),
        source_count: src.length,
        last_updated: r.updated_at ?? '',
        research_id: r.id,
      };
    });

    res.json({ total: competitors.length, competitors });
  } catch (error) {
    console.error('Intelligence /competitors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// GET /landscape
// ---------------------------------------------------------------------------
intelligenceRouter.get('/landscape', anyRead, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const region = requireRegion(req, res); if (!region) return;
    const items = await fetchResearch(region);

    const byDomain = new Map<string, ResearchDoc[]>();
    for (const r of items) {
      for (const d of r.dimensions.domains ?? []) {
        const key = d.code || d.id;
        if (!byDomain.has(key)) byDomain.set(key, []);
        byDomain.get(key)!.push(r);
      }
    }

    const landscape = Array.from(byDomain, ([domain, entries]) => {
      const src = entries.flatMap(allSources);
      const latestUpdate = entries.map((r) => r.updated_at ?? '').sort().pop() ?? '';
      return {
        region, domain,
        research_count: entries.length,
        avg_trust_tier: avgTrustTier(src),
        latest_update: latestUpdate,
        research_ids: entries.map((r) => r.id),
      };
    });

    res.json({ total: landscape.length, landscape });
  } catch (error) {
    console.error('Intelligence /landscape error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// GET /summary
// ---------------------------------------------------------------------------
intelligenceRouter.get('/summary', anyRead, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const region = requireRegion(req, res); if (!region) return;
    const domain = req.query.domain as string | undefined;
    const format = (req.query.format as string) || 'narrative';

    const items = await fetchResearch(region, domain);
    const top = items.sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? '')).slice(0, 5);

    const generatedAt = new Date().toISOString();
    const metadata = { region, domain: domain ?? null, entry_count: top.length, generated_at: generatedAt };

    if (format === 'structured') {
      const structured = top.map((r) => ({
        id: r.id, title: r.title, status: r.status, origin: r.origin,
        source_count: allSources(r).length,
        synthesis: r.synthesis || r.description || '',
        updated_at: r.updated_at,
      }));
      res.json({ content: structured, metadata });
      return;
    }

    const heading = `# Research Brief: ${region}${domain ? ` / ${domain}` : ''}`;
    const subheading = `**Entries:** ${top.length} | **Generated:** ${generatedAt}`;
    const sections = top.map((r) => {
      const body = r.synthesis || r.description || '_No synthesis available._';
      return `### ${r.title}\n**Status:** ${r.status} | **Origin:** ${r.origin} | **Sources:** ${allSources(r).length}\n${body}`;
    });
    const content = [heading, subheading, '', sections.join('\n---\n')].join('\n');

    res.json({ content, metadata });
  } catch (error) {
    console.error('Intelligence /summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
