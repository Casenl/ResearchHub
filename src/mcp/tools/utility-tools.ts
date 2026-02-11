import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getResearchBrief } from '@/lib/services/intelligence-query-service';

export function registerUtilityTools(server: McpServer): void {
  server.tool(
    'get_research_brief',
    'Token-efficient markdown summary for a region, optionally filtered by domain',
    {
      region: z.string().describe('Market region code (e.g. "NL", "DE")'),
      domain: z.string().optional().describe('Domain code filter'),
    },
    async (input) => {
      try {
        const brief = await getResearchBrief(input.region, input.domain);
        return { content: [{ type: 'text' as const, text: brief }] };
      } catch (error) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );
}
