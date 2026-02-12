import { getAdminFirestore } from '@/lib/firebase-admin';
import { QueryResearchSchema } from '@/lib/validations';
import type { Research } from '@/types';

type ResearchWithId = Research & { id: string };

interface LandscapeEntry {
  region: string;
  domain: string;
  research_count: number;
  avg_trust_tier: number;
  latest_update: string;
  research_ids: string[];
}

/** Query research entries with filters. */
export async function queryResearch(input: unknown): Promise<{
  items: ResearchWithId[];
  total: number;
}> {
  const filters = QueryResearchSchema.parse(input);
  const db = getAdminFirestore();

  try {
    let query: FirebaseFirestore.Query = db.collection('research');

    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    if (filters.origin) {
      query = query.where('origin', '==', filters.origin);
    }
    if (filters.fresher_than) {
      query = query.where('updated_at', '>=', filters.fresher_than);
    }

    query = query.orderBy('updated_at', 'desc');

    const snapshot = await query.get();
    let items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ResearchWithId[];

    // Client-side filtering for dimension-based queries
    // Firestore cannot query nested arrays efficiently
    if (filters.region) {
      items = items.filter(r =>
        r.dimensions.markets.some(m => m.code === filters.region || m.id === filters.region)
      );
    }
    if (filters.domain) {
      items = items.filter(r =>
        r.dimensions.domains.some(d => d.code === filters.domain || d.id === filters.domain)
      );
    }
    if (filters.sector) {
      items = items.filter(r =>
        r.dimensions.sectors.some(s => s.code === filters.sector || s.id === filters.sector)
      );
    }
    if (filters.min_trust_tier) {
      items = items.filter(r =>
        r.notebooks.some(nb =>
          nb.sources.some(s => s.quality_tier <= filters.min_trust_tier!)
        )
      );
    }

    const total = items.length;
    const paginated = items.slice(filters.offset, filters.offset + filters.limit);

    return { items: paginated, total };
  } catch (error) {
    console.error('Research query failed:', error);
    throw error;
  }
}

/** Get competitive landscape for a region across all domains. */
export async function getLandscape(region: string): Promise<LandscapeEntry[]> {
  const { items } = await queryResearch({ region, limit: 100 });

  const byDomain = new Map<string, ResearchWithId[]>();
  for (const item of items) {
    for (const domain of item.dimensions.domains) {
      const key = domain.code || domain.id;
      if (!byDomain.has(key)) byDomain.set(key, []);
      byDomain.get(key)!.push(item);
    }
  }

  const landscape: LandscapeEntry[] = [];
  for (const [domain, entries] of byDomain) {
    const allTiers = entries.flatMap(r =>
      r.notebooks.flatMap(nb => nb.sources.map(s => s.quality_tier))
    );
    const avgTier = allTiers.length > 0
      ? Math.round(allTiers.reduce((a, b) => a + b, 0) / allTiers.length)
      : 8;

    landscape.push({
      region,
      domain,
      research_count: entries.length,
      avg_trust_tier: avgTier,
      latest_update: entries[0]?.updated_at ?? '',
      research_ids: entries.map(r => r.id),
    });
  }

  return landscape;
}

/** Generate a narrative summary for a region+domain combination. */
export async function getResearchBrief(
  region: string,
  domain?: string,
): Promise<string> {
  const filters: Record<string, unknown> = { region, limit: 10 };
  if (domain) filters.domain = domain;

  const { items } = await queryResearch(filters);

  if (items.length === 0) {
    return `No research found for region: ${region}${domain ? `, domain: ${domain}` : ''}.`;
  }

  // Build narrative from most recent, highest-trust research
  const sorted = items.sort((a, b) => {
    const aDate = new Date(a.updated_at).getTime();
    const bDate = new Date(b.updated_at).getTime();
    return bDate - aDate;
  });

  const sections = sorted.slice(0, 5).map(r => {
    const sourceCount = r.notebooks.reduce((sum, nb) => sum + nb.sources.length, 0);
    return `### ${r.title}\n**Status:** ${r.status} | **Origin:** ${r.origin} | **Sources:** ${sourceCount}\n\n${r.synthesis || r.description || 'No synthesis available.'}\n`;
  });

  const header = `# Research Brief: ${region}${domain ? ` / ${domain}` : ''}\n\n**Entries:** ${items.length} | **Generated:** ${new Date().toISOString()}\n\n`;
  return header + sections.join('\n---\n\n');
}
