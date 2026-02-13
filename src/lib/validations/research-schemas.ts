import { z } from 'zod';

// Reusable enum schemas matching types/index.ts
const ResearchOriginSchema = z.enum(['human', 'agent', 'hybrid']);
const ReviewStatusSchema = z.enum(['none', 'pending', 'approved', 'rejected']);
const ResearchStatusSchema = z.enum(['draft', 'in_progress', 'review', 'published', 'archived']);
const OutputFormatSchema = z.enum(['factsheet', 'competitive', 'proposition', 'full']);
const RefreshScheduleSchema = z.enum(['quarterly', 'semi_annually', 'ad_hoc']);
const ResearchTypeSchema = z.enum(['new', 'refresh', 'clone']);

const AgentIdentitySchema = z.object({
  agent_id: z.string().min(1),
  agent_name: z.string().min(1),
  agent_version: z.string().min(1),
  run_id: z.string().min(1),
});

const DimensionIdsSchema = z.object({
  market_ids: z.array(z.string()),
  domain_ids: z.array(z.string()),
  sector_ids: z.array(z.string()),
});

export const CreateResearchSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).default(''),
  type: ResearchTypeSchema.default('new'),
  output_format: OutputFormatSchema,
  refresh_schedule: RefreshScheduleSchema.default('ad_hoc'),
  origin: ResearchOriginSchema,
  agent_identity: AgentIdentitySchema.nullable().default(null),
  dimensions: DimensionIdsSchema,
  findings: z.string().default(''),
  synthesis: z.string().default(''),
  assumptions: z.array(z.string()).default([]),
  input_context: z.array(z.string()).default([]),
  tag_ids: z.array(z.string()).default([]),
  context_document_ids: z.array(z.string()).default([]),
});

export const UpdateResearchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  // status intentionally excluded — use workflow transitions, not direct updates
  findings: z.string().optional(),
  synthesis: z.string().optional(),
  assumptions: z.array(z.string()).optional(),
  review_status: ReviewStatusSchema.optional(),
  change_log: z.string().optional(),
});

export const QueryResearchSchema = z.object({
  region: z.string().optional(),
  domain: z.string().optional(),
  sector: z.string().optional(),
  origin: ResearchOriginSchema.optional(),
  min_trust_tier: z.number().int().min(1).max(8).optional(),
  status: ResearchStatusSchema.optional(),
  fresher_than: z.iso.datetime().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// Export inferred types for use in services
export type CreateResearchInput = z.infer<typeof CreateResearchSchema>;
export type UpdateResearchInput = z.infer<typeof UpdateResearchSchema>;
export type QueryResearchInput = z.infer<typeof QueryResearchSchema>;
