import { z } from 'zod';

// =============================================================================
// Reusable enums matching src/types/index.ts
// =============================================================================

const ResearchOriginSchema = z.enum(['human', 'agent', 'hybrid']);
const ReviewStatusSchema = z.enum(['none', 'pending', 'approved', 'rejected']);
const ResearchStatusSchema = z.enum(['draft', 'in_progress', 'review', 'published', 'archived']);
const OutputFormatSchema = z.enum(['factsheet', 'competitive', 'proposition', 'full']);
const RefreshScheduleSchema = z.enum(['quarterly', 'semi_annually', 'ad_hoc']);
const ResearchTypeSchema = z.enum(['new', 'refresh', 'clone']);
const QualityTierSchema = z.number().int().min(1).max(8);
const ResearchToolSchema = z.enum(['notebooklm', 'claude', 'perplexity', 'manual']);
const ValidationStatusSchema = z.enum(['unverified', 'corroborated', 'human_verified', 'disputed']);
const ApiKeyPermissionSchema = z.enum(['read', 'read_write', 'admin']);

/** Reusable: Firestore document ID (safe chars, reasonable length). */
export const DocumentIdSchema = z.string().min(1).max(1500).regex(/^[a-zA-Z0-9_-]+$/);

/** ISO date string or empty — rejects non-date strings. */
const ISODateOrEmpty = z.union([
  z.string().date(),
  z.string().datetime(),
  z.literal(''),
]).default('');

/** ISO datetime string, nullable — for optional timestamp fields. */
const ISODateTimeOrNull = z.string().datetime().nullable().default(null);

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

// =============================================================================
// Research schemas
// =============================================================================

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
  fresher_than: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// =============================================================================
// Source schemas
// =============================================================================

export const CreateSourceSchema = z.object({
  title: z.string().min(1).max(300),
  url: z.string().url(),
  publisher: z.string().min(1).max(200),
  publication_date: ISODateOrEmpty,
  quality_tier: QualityTierSchema,
  discovered_by: ResearchToolSchema,
  notes: z.string().max(2000).default(''),
});

/** Partial source schema for PATCH updates — re-validates each allowed field. */
export const UpdateSourceSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  url: z.string().url().optional(),
  publisher: z.string().min(1).max(200).optional(),
  quality_tier: QualityTierSchema.optional(),
  notes: z.string().max(2000).optional(),
});

export const ValidateSourceSchema = z.object({
  validation_status: ValidationStatusSchema,
  validation_notes: z.string().max(2000).default(''),
});

// =============================================================================
// File schemas
// =============================================================================

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
    { message: `File type must be one of: ${ALLOWED_MIME_TYPES.join(', ')}` },
  ),
  file_data: z.string().min(1), // base64 encoded
  source_id: z.string().max(100).nullable().default(null),
});

export { MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES };

// =============================================================================
// API key schemas
// =============================================================================

export const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: ApiKeyPermissionSchema,
  agent_identity: AgentIdentitySchema,
  expires_at: ISODateTimeOrNull,
});

// =============================================================================
// Competitor schemas
// =============================================================================

const CompetitorTypeSchema = z.enum(['msp', 'vendor_partner', 'both']);
const CompetitorEventTypeSchema = z.enum([
  'service_launch', 'acquisition', 'partnership',
  'market_entry', 'market_exit', 'pricing_change',
  'certification', 'leadership_change', 'funding', 'other',
]);
const PackagingModelSchema = z.enum(['managed', 'project', 'hybrid', 'consulting']);

export const CreateCompetitorSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).default(''),
  website: z.string().url().or(z.literal('')).default(''),
  type: CompetitorTypeSchema,
  headquarters_market_id: z.string().max(100).default(''),
  employee_range: z.string().max(100).default(''),
  revenue_range: z.string().max(100).default(''),
  founded_year: z.number().int().min(1800).max(2100).nullable().default(null),
  tag_ids: z.array(z.string().max(100)).max(50).default([]),
});

export const UpdateCompetitorSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  website: z.string().url().or(z.literal('')).optional(),
  type: CompetitorTypeSchema.optional(),
  headquarters_market_id: z.string().max(100).optional(),
  employee_range: z.string().max(100).optional(),
  revenue_range: z.string().max(100).optional(),
  founded_year: z.number().int().min(1800).max(2100).nullable().optional(),
  tag_ids: z.array(z.string().max(100)).max(50).optional(),
});

export const AddPositionSchema = z.object({
  market_id: z.string().min(1).max(100),
  domain_id: z.string().min(1).max(100),
  sector_ids: z.array(z.string().max(100)).max(50).default([]),
  services: z.array(z.string().max(200)).max(50).default([]),
  packaging_model: PackagingModelSchema,
  vendor_partnerships: z.array(z.string().max(200)).max(50).default([]),
  strengths: z.string().max(5000).default(''),
  weaknesses: z.string().max(5000).default(''),
  notes: z.string().max(5000).default(''),
});

export const UpdatePositionSchema = AddPositionSchema;

export const AddEventSchema = z.object({
  event_type: CompetitorEventTypeSchema,
  title: z.string().min(1).max(300),
  description: z.string().max(5000).default(''),
  date: z.union([z.string().date(), z.string().datetime()]),
  market_ids: z.array(z.string().max(100)).max(50).default([]),
  domain_ids: z.array(z.string().max(100)).max(50).default([]),
  sector_ids: z.array(z.string().max(100)).max(50).default([]),
  source_url: z.string().url().or(z.literal('')).default(''),
});

// =============================================================================
// Legislation schemas
// =============================================================================

const LegislationScopeSchema = z.enum(['national', 'eu', 'international']);

export const CreateLegislationSchema = z.object({
  name: z.string().min(1).max(300),
  description: z.string().max(5000).default(''),
  market_ids: z.array(z.string().max(100)).min(1).max(50),
  sector_ids: z.array(z.string().max(100)).min(1).max(50),
  scope: LegislationScopeSchema,
  effective_date: z.union([z.string().date(), z.string().datetime()]),
  enforcement_authority: z.string().max(300).default(''),
  compliance_deadline: z.union([z.string().date(), z.string().datetime()]).nullable().default(null),
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
  effective_date: z.union([z.string().date(), z.string().datetime()]).optional(),
  enforcement_authority: z.string().max(300).optional(),
  compliance_deadline: z.union([z.string().date(), z.string().datetime()]).nullable().optional(),
  context_document_id: z.string().max(100).nullable().optional(),
  url: z.string().url().or(z.literal('')).nullable().optional(),
  tags: z.array(z.string().max(100)).max(50).optional(),
});

// =============================================================================
// Inferred types
// =============================================================================

export type CreateResearchInput = z.infer<typeof CreateResearchSchema>;
export type UpdateResearchInput = z.infer<typeof UpdateResearchSchema>;
export type QueryResearchInput = z.infer<typeof QueryResearchSchema>;
export type CreateSourceInput = z.infer<typeof CreateSourceSchema>;
export type UpdateSourceInput = z.infer<typeof UpdateSourceSchema>;
export type ValidateSourceInput = z.infer<typeof ValidateSourceSchema>;
export type UploadFileInput = z.infer<typeof UploadFileSchema>;
export type CreateApiKeyInput = z.infer<typeof CreateApiKeySchema>;
export type CreateCompetitorInput = z.infer<typeof CreateCompetitorSchema>;
export type UpdateCompetitorInput = z.infer<typeof UpdateCompetitorSchema>;
export type AddPositionInput = z.infer<typeof AddPositionSchema>;
export type AddEventInput = z.infer<typeof AddEventSchema>;
export type CreateLegislationInput = z.infer<typeof CreateLegislationSchema>;
export type UpdateLegislationInput = z.infer<typeof UpdateLegislationSchema>;
