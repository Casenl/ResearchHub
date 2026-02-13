import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { addSource, validateSource } from '@/lib/services/source-service';
import { uploadResearchFile } from '@/lib/services/file-service';

function errorResponse(message: string) {
  return { content: [{ type: 'text' as const, text: `Error: ${message}` }], isError: true };
}

/** ISO date or datetime string. */
const ISODateOrEmpty = z.union([
  z.string().date(),
  z.string().datetime(),
  z.literal(''),
]).describe('ISO date (YYYY-MM-DD) or datetime, or empty string');

export function registerSourceTools(server: McpServer): void {
  server.tool(
    'add_source',
    'Add a source to a research notebook',
    {
      research_id: z.string().min(1).max(1500).describe('Research document ID'),
      notebook_id: z.string().min(1).max(1500).describe('Notebook ID'),
      title: z.string().min(1).max(300),
      url: z.string().url(),
      publisher: z.string().min(1).max(200),
      publication_date: ISODateOrEmpty.optional(),
      quality_tier: z.number().int().min(1).max(8),
      discovered_by: z.enum(['notebooklm', 'claude', 'perplexity', 'manual']),
      notes: z.string().max(2000).optional(),
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
      research_id: z.string().min(1).max(1500).describe('Research document ID'),
      source_id: z.string().min(1).max(1500).describe('Source ID'),
      validation_status: z.enum(['corroborated', 'human_verified', 'disputed']),
      validation_notes: z.string().max(2000).optional(),
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
      research_id: z.string().min(1).max(1500).describe('Research document ID'),
      file_name: z.string().min(1).max(255),
      file_type: z.enum([
        'application/pdf',
        'text/markdown',
        'text/plain',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/csv',
        'application/json',
      ]),
      file_data: z.string().max(70_000_000).describe('Base64-encoded file content (max ~50MB)').optional(),
      source_url: z.string().url().max(2048).describe('URL to download file from (alternative to file_data)').optional(),
      source_id: z.string().max(1500).optional(),
    },
    async (input) => {
      try {
        const MAX_DOWNLOAD_BYTES = 50 * 1024 * 1024; // 50 MB
        let fileBuffer: Buffer;

        if (input.source_url) {
          // HEAD check to reject obviously oversized downloads
          const head = await fetch(input.source_url, { method: 'HEAD', redirect: 'follow' });
          const contentLength = Number(head.headers.get('content-length') || 0);
          if (contentLength > MAX_DOWNLOAD_BYTES) {
            return errorResponse(`Remote file too large: ${contentLength} bytes (max ${MAX_DOWNLOAD_BYTES})`);
          }

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 60_000); // 60s timeout
          try {
            const response = await fetch(input.source_url, {
              redirect: 'follow',
              signal: controller.signal,
            });
            if (!response.ok) {
              return errorResponse(`Download failed: HTTP ${response.status} from ${input.source_url}`);
            }
            const arrayBuf = await response.arrayBuffer();
            if (arrayBuf.byteLength > MAX_DOWNLOAD_BYTES) {
              return errorResponse(`Downloaded file too large: ${arrayBuf.byteLength} bytes (max ${MAX_DOWNLOAD_BYTES})`);
            }
            fileBuffer = Buffer.from(arrayBuf);
          } finally {
            clearTimeout(timeout);
          }
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
