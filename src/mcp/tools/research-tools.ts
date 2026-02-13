import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createResearch, getResearch, updateResearch } from '@/lib/services/research-crud-service';
import { queryResearch } from '@/lib/services/intelligence-query-service';

const errorResponse = (message: string) => ({
  content: [{ type: 'text' as const, text: `Error: ${message}` }],
  isError: true as const,
});

const jsonResponse = (data: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
});

export function registerResearchTools(server: McpServer): void {
  // 1. Search / filter research entries
  server.tool(
    'search_research',
    'Search and filter research entries by region, domain, sector, origin, trust tier, or status',
    {
      region: z.string().max(100).optional().describe('Market region code or ID'),
      domain: z.string().max(100).optional().describe('Domain code or ID'),
      sector: z.string().max(100).optional().describe('Sector code or ID'),
      origin: z.enum(['human', 'agent', 'hybrid']).optional(),
      min_trust_tier: z.number().int().min(1).max(8).optional(),
      status: z.enum(['draft', 'in_progress', 'review', 'published', 'archived']).optional(),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
    },
    async (input) => {
      try {
        const result = await queryResearch(input);
        return jsonResponse(result);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return errorResponse(`Failed to search research: ${msg}`);
      }
    },
  );

  // 2. Get a single research entry by ID
  server.tool(
    'get_research',
    'Get a single research entry by its ID',
    {
      id: z.string().min(1).max(1500).describe('Research document ID'),
    },
    async (input) => {
      try {
        const research = await getResearch(input.id);
        if (!research) {
          return errorResponse(`Research not found: ${input.id}`);
        }
        return jsonResponse(research);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return errorResponse(`Failed to get research: ${msg}`);
      }
    },
  );

  // 3. Create a new research entry (agent origin)
  server.tool(
    'add_research',
    'Create a new research entry on behalf of an agent',
    {
      title: z.string().min(1).max(200),
      description: z.string().max(5000).optional(),
      output_format: z.enum(['factsheet', 'competitive', 'proposition', 'full']),
      dimensions: z.object({
        market_ids: z.array(z.string().max(100)).max(50),
        domain_ids: z.array(z.string().max(100)).max(50),
        sector_ids: z.array(z.string().max(100)).max(50),
      }),
      findings: z.string().max(50000).optional(),
      synthesis: z.string().max(50000).optional(),
      assumptions: z.array(z.string().max(2000)).max(100).optional(),
      input_context: z.array(z.string().max(5000)).max(50).optional(),
      agent_identity: z.object({
        agent_id: z.string().min(1),
        agent_name: z.string().min(1),
        agent_version: z.string().min(1),
        run_id: z.string().min(1),
      }),
    },
    async (input) => {
      try {
        const payload = {
          title: input.title,
          description: input.description ?? '',
          output_format: input.output_format,
          dimensions: input.dimensions,
          findings: input.findings ?? '',
          synthesis: input.synthesis ?? '',
          assumptions: input.assumptions ?? [],
          input_context: input.input_context ?? [],
          origin: 'agent' as const,
          agent_identity: input.agent_identity,
        };
        const result = await createResearch(
          payload,
          input.agent_identity.agent_id,
          input.agent_identity.agent_name,
        );
        return jsonResponse(result);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return errorResponse(`Failed to create research: ${msg}`);
      }
    },
  );

  // 4. Update an existing research entry
  server.tool(
    'update_research',
    'Update fields on an existing research entry',
    {
      id: z.string().min(1).max(1500).describe('Research document ID'),
      title: z.string().min(1).max(200).optional(),
      description: z.string().max(5000).optional(),
      // status intentionally excluded — use workflow transitions, not direct updates
      findings: z.string().max(50000).optional(),
      synthesis: z.string().max(50000).optional(),
      assumptions: z.array(z.string().max(2000)).max(100).optional(),
      review_status: z.enum(['none', 'pending', 'approved', 'rejected']).optional(),
      change_log: z.string().max(10000).optional(),
    },
    async (input) => {
      try {
        const { id, ...updates } = input;
        await updateResearch(id, updates, 'mcp-server', 'MCP Server');
        return jsonResponse({ success: true, id, updated_fields: Object.keys(updates) });
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return errorResponse(`Failed to update research: ${msg}`);
      }
    },
  );
}
