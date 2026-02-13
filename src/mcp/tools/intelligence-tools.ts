import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { queryResearch, getLandscape } from '@/lib/services/intelligence-query-service';

export function registerIntelligenceTools(server: McpServer): void {
  server.tool(
    'get_competitors',
    'Get competitors for a region, optionally filtered by domain and sector',
    {
      region: z.string().min(1).max(100).describe('Market region code (e.g. "NL", "DE")'),
      domain: z.string().max(100).optional().describe('Domain code filter'),
      sector: z.string().max(100).optional().describe('Sector code filter'),
    },
    async (input) => {
      try {
        const { items } = await queryResearch({
          region: input.region,
          domain: input.domain,
          sector: input.sector,
          limit: 50,
        });

        const competitors = items.map(r => {
          const allSources = r.notebooks.flatMap(nb => nb.sources);
          const bestTier = allSources.length > 0
            ? Math.min(...allSources.map(s => s.quality_tier))
            : 8;

          return {
            name: r.title,
            region: input.region,
            domain: r.dimensions.domains[0]?.code ?? 'unknown',
            status: r.status,
            trust_tier: bestTier,
            source_count: allSources.length,
            last_updated: r.updated_at,
            research_id: r.id,
          };
        });

        return { content: [{ type: 'text' as const, text: JSON.stringify(competitors, null, 2) }] };
      } catch (error) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'get_landscape',
    'Full region x domain competitive matrix for a given region',
    {
      region: z.string().min(1).max(100).describe('Market region code (e.g. "NL", "DE")'),
    },
    async (input) => {
      try {
        const entries = await getLandscape(input.region);
        return { content: [{ type: 'text' as const, text: JSON.stringify(entries, null, 2) }] };
      } catch (error) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'get_region_context',
    'Market context summary for a region: research count, domains, trust, latest updates',
    {
      region: z.string().min(1).max(100).describe('Market region code (e.g. "NL", "DE")'),
    },
    async (input) => {
      try {
        const { items, total } = await queryResearch({ region: input.region, limit: 50 });

        const domains = [...new Set(items.flatMap(r => r.dimensions.domains.map(d => d.code ?? d.id)))];
        const allTiers = items.flatMap(r =>
          r.notebooks.flatMap(nb => nb.sources.map(s => s.quality_tier))
        );
        const avgTrustTier = allTiers.length > 0
          ? Math.round(allTiers.reduce((a, b) => a + b, 0) / allTiers.length)
          : null;
        const latestUpdate = items.length > 0 ? items[0].updated_at : null;

        const summary = {
          region: input.region,
          total_research: total,
          domains_covered: domains,
          avg_trust_tier: avgTrustTier,
          latest_update: latestUpdate,
          research: items.map(r => ({ id: r.id, title: r.title, status: r.status })),
        };

        return { content: [{ type: 'text' as const, text: JSON.stringify(summary, null, 2) }] };
      } catch (error) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );
}
