import { z } from 'zod';

const LegislationScopeSchema = z.enum(['national', 'eu', 'international']);

export const CreateLegislationSchema = z.object({
  name: z.string().min(1).max(300),
  description: z.string().max(5000).default(''),
  market_ids: z.array(z.string().max(100)).min(1).max(50),
  sector_ids: z.array(z.string().max(100)).min(1).max(50),
  scope: LegislationScopeSchema,
  effective_date: z.string().date(),
  enforcement_authority: z.string().max(300).default(''),
  compliance_deadline: z.string().date().nullable().default(null),
  context_document_id: z.string().max(100).nullable().default(null),
  url: z.string().url().or(z.literal('')).nullable().default(null),
  tags: z.array(z.string().max(100)).max(50).default([]),
});

export const UpdateLegislationSchema = z.object({
  name: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).optional(),
  market_ids: z.array(z.string().max(100)).min(1).max(50).optional(),
  sector_ids: z.array(z.string().max(100)).min(1).max(50).optional(),
  scope: LegislationScopeSchema.optional(),
  effective_date: z.string().date().optional(),
  enforcement_authority: z.string().max(300).optional(),
  compliance_deadline: z.string().date().nullable().optional(),
  context_document_id: z.string().max(100).nullable().optional(),
  url: z.string().url().or(z.literal('')).nullable().optional(),
  tags: z.array(z.string().max(100)).max(50).optional(),
});

export const QueryLegislationSchema = z.object({
  market_id: z.string().max(100).optional(),
  sector_id: z.string().max(100).optional(),
  scope: LegislationScopeSchema.optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

// Export inferred types for use in services
export type CreateLegislationInput = z.infer<typeof CreateLegislationSchema>;
export type UpdateLegislationInput = z.infer<typeof UpdateLegislationSchema>;
export type QueryLegislationInput = z.infer<typeof QueryLegislationSchema>;
