import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  createLegislationEntry,
  getLegislationEntry,
  queryLegislationEntries,
} from '@/lib/services/legislation-service';

const errorResponse = (message: string) => ({
  content: [{ type: 'text' as const, text: `Error: ${message}` }],
  isError: true as const,
});

const jsonResponse = (data: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
});

export function registerLegislationTools(server: McpServer): void {
  // 1. Search / filter legislation entries
  server.tool(
    'search_legislation',
    'Search legislation entries by market, sector, or scope',
    {
      market_id: z.string().max(100).optional().describe('Market ID to filter by'),
      sector_id: z.string().max(100).optional().describe('Sector ID to filter by'),
      scope: z.enum(['national', 'eu', 'international']).optional().describe('Legislation scope'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
    },
    async (input) => {
      try {
        const result = await queryLegislationEntries(input);
        return jsonResponse(result);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return errorResponse(`Failed to search legislation: ${msg}`);
      }
    },
  );

  // 2. Get a single legislation entry by ID
  server.tool(
    'get_legislation',
    'Get a single legislation entry by its ID',
    {
      id: z.string().min(1).max(1500).describe('Legislation document ID'),
    },
    async (input) => {
      try {
        const entry = await getLegislationEntry(input.id);
        if (!entry) {
          return errorResponse(`Legislation not found: ${input.id}`);
        }
        return jsonResponse(entry);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return errorResponse(`Failed to get legislation: ${msg}`);
      }
    },
  );

  // 3. Create a new legislation entry
  server.tool(
    'add_legislation',
    'Create a new legislation entry',
    {
      name: z.string().min(1).max(300),
      description: z.string().max(5000).optional(),
      market_ids: z.array(z.string().max(100)).min(1).max(50),
      sector_ids: z.array(z.string().max(100)).min(1).max(50),
      scope: z.enum(['national', 'eu', 'international']),
      effective_date: z.string().describe('ISO 8601 date (YYYY-MM-DD)'),
      enforcement_authority: z.string().max(300).optional(),
      compliance_deadline: z.string().nullable().optional().describe('ISO 8601 date or null'),
      context_document_id: z.string().max(100).nullable().optional(),
      url: z.string().url().or(z.literal('')).nullable().optional(),
      tags: z.array(z.string().max(100)).max(50).optional(),
    },
    async (input) => {
      try {
        const result = await createLegislationEntry(
          input,
          'mcp-server',
          'MCP Server',
        );
        return jsonResponse(result);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return errorResponse(`Failed to create legislation: ${msg}`);
      }
    },
  );
}
