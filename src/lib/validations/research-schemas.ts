import { z } from 'zod';

// Reusable enum schemas matching types/index.ts
const ResearchOriginSchema = z.enum(['human', 'agent', 'hybrid']);
const ReviewStatusSchema = z.enum(['none', 'pending', 'approved', 'rejected']);
const ResearchStatusSchema = z.enum(['draft', 'in_progress', 'review', 'published', 'archived']);
const OutputFormatSchema = z.enum(['factsheet', 'competitive', 'proposition', 'full']);
const RefreshScheduleSchema = z.enum(['quarterly', 'semi_annually', 'ad_hoc']);
const ResearchTypeSchema = z.enum(['new', 'refresh', 'clone']);

/** Reusable: Firestore document ID (safe chars, reasonable length). */
export const DocumentIdSchema = z.string().min(1).max(1500).regex(/^[a-zA-Z0-9_-]+$/, 'Invalid document ID');

const AgentIdentitySchema = z.object({
  agent_id: z.string().min(1).max(200),
  agent_name: z.string().min(1).max(200),
  agent_version: z.string().min(1).max(50),
  run_id: z.string().min(1).max(200),
});

const DimensionIdsSchema = z.object({
  market_ids: z.array(z.string().max(100)).max(50),
  domain_ids: z.array(z.string().max(100)).max(50),
  sector_ids: z.array(z.string().max(100)).max(50),
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
  findings: z.string().max(50000).default(''),
  synthesis: z.string().max(50000).default(''),
  assumptions: z.array(z.string().max(2000)).max(100).default([]),
  input_context: z.array(z.string().max(5000)).max(50).default([]),
  tag_ids: z.array(z.string().max(100)).max(50).default([]),
  context_document_ids: z.array(z.string().max(100)).max(50).default([]),
});

export const UpdateResearchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  // status intentionally excluded — use workflow transitions, not direct updates
  findings: z.string().max(50000).optional(),
  synthesis: z.string().max(50000).optional(),
  assumptions: z.array(z.string().max(2000)).max(100).optional(),
  review_status: ReviewStatusSchema.optional(),
  change_log: z.string().max(10000).optional(),
});

export const QueryResearchSchema = z.object({
  region: z.string().max(100).optional(),
  domain: z.string().max(100).optional(),
  sector: z.string().max(100).optional(),
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
