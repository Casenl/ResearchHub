import { z } from 'zod';

const QualityTierSchema = z.number().int().min(1).max(8) as z.ZodType<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>;
const ResearchToolSchema = z.enum(['notebooklm', 'claude', 'perplexity', 'manual']);
const ValidationStatusSchema = z.enum(['unverified', 'corroborated', 'human_verified', 'disputed']);

/** ISO date string or empty — rejects non-date strings like "banana". */
const ISODateOrEmpty = z.union([
  z.iso.date(),
  z.iso.datetime(),
  z.literal(''),
]).default('');

export const CreateSourceSchema = z.object({
  title: z.string().min(1).max(300),
  url: z.url(),
  publisher: z.string().min(1).max(200),
  publication_date: ISODateOrEmpty,
  quality_tier: QualityTierSchema,
  discovered_by: ResearchToolSchema,
  notes: z.string().max(2000).default(''),
});

export const ValidateSourceSchema = z.object({
  validation_status: ValidationStatusSchema,
  validation_notes: z.string().max(2000).default(''),
});

export type CreateSourceInput = z.infer<typeof CreateSourceSchema>;
export type ValidateSourceInput = z.infer<typeof ValidateSourceSchema>;
