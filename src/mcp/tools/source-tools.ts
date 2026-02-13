import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { addSource, validateSource } from '@/lib/services/source-service';
import { uploadResearchFile } from '@/lib/services/file-service';

function errorResponse(message: string) {
  return { content: [{ type: 'text' as const, text: `Error: ${message}` }], isError: true };
}

export function registerSourceTools(server: McpServer): void {
  server.tool(
    'add_source',
    'Add a source to a research notebook',
    {
      research_id: z.string(),
      notebook_id: z.string(),
      title: z.string(),
      url: z.string(),
      publisher: z.string(),
      publication_date: z.string().optional(),
      quality_tier: z.number().min(1).max(8),
      discovered_by: z.enum(['notebooklm', 'claude', 'perplexity', 'manual']),
      notes: z.string().optional(),
    },
    async (input) => {
      try {
        const { research_id, notebook_id, ...sourceInput } = input;
        const source = await addSource(research_id, notebook_id, sourceInput, 'mcp-agent');
        return { content: [{ type: 'text' as const, text: JSON.stringify(source) }] };
      } catch (error) {
        return errorResponse(error instanceof Error ? error.message : String(error));
      }
    },
  );

  server.tool(
    'validate_source',
    'Record a validation event on a source',
    {
      research_id: z.string(),
      source_id: z.string(),
      validation_status: z.enum(['corroborated', 'human_verified', 'disputed']),
      validation_notes: z.string().optional(),
    },
    async (input) => {
      try {
        const { research_id, source_id, validation_status, validation_notes } = input;
        const result = await validateSource(
          research_id,
          source_id,
          { validation_status, validation_notes },
          'mcp-agent',
        );
        return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
      } catch (error) {
        return errorResponse(error instanceof Error ? error.message : String(error));
      }
    },
  );

  server.tool(
    'upload_file',
    'Upload a file to a research entry. Provide either source_url (preferred for large files) or file_data (base64).',
    {
      research_id: z.string(),
      file_name: z.string(),
      file_type: z.string(),
      file_data: z.string().describe('Base64-encoded file content').optional(),
      source_url: z.string().url().describe('URL to download file from (alternative to file_data)').optional(),
      source_id: z.string().optional(),
    },
    async (input) => {
      try {
        let fileBuffer: Buffer;

        if (input.source_url) {
          const response = await fetch(input.source_url, { redirect: 'follow' });
          if (!response.ok) {
            return errorResponse(`Download failed: HTTP ${response.status} from ${input.source_url}`);
          }
          fileBuffer = Buffer.from(await response.arrayBuffer());
        } else if (input.file_data) {
          fileBuffer = Buffer.from(input.file_data, 'base64');
        } else {
          return errorResponse('Provide either source_url or file_data');
        }

        const attachment = await uploadResearchFile({
          research_id: input.research_id,
          file_name: input.file_name,
          file_type: input.file_type,
          file_buffer: fileBuffer,
          uploaded_by: 'mcp-agent',
          origin: 'agent',
          source_id: input.source_id ?? null,
        });
        return { content: [{ type: 'text' as const, text: JSON.stringify(attachment) }] };
      } catch (error) {
        return errorResponse(error instanceof Error ? error.message : String(error));
      }
    },
  );
}
