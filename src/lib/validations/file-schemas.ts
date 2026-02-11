import { z } from 'zod';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/markdown',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'application/json',
] as const;

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export const UploadFileSchema = z.object({
  file_name: z.string().min(1).max(255),
  file_type: z.string().refine(
    (type) => (ALLOWED_MIME_TYPES as readonly string[]).includes(type),
    { message: `File type must be one of: ${ALLOWED_MIME_TYPES.join(', ')}` }
  ),
  size_bytes: z.number().int().positive().max(MAX_FILE_SIZE_BYTES, {
    message: `File size must not exceed ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
  }),
  source_id: z.string().nullable().default(null),
});

export const ALLOWED_MIME_TYPES_LIST = ALLOWED_MIME_TYPES;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_BYTES;

export type UploadFileInput = z.infer<typeof UploadFileSchema>;
