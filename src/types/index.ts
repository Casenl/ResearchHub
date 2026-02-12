// =============================================================================
// ITQ Market Intelligence Portal — Type Definitions
// =============================================================================

// -----------------------------------------------------------------------------
// Enums / Union Types
// -----------------------------------------------------------------------------

export type ResearchStatus =
  | 'draft'
  | 'in_progress'
  | 'review'
  | 'published'
  | 'archived';

export type ResearchType = 'new' | 'refresh' | 'clone';

export type OutputFormat = 'factsheet' | 'competitive' | 'proposition' | 'full';

export type RefreshSchedule = 'quarterly' | 'semi_annually' | 'ad_hoc';

export type NotebookType =
  | 'market_regulation'
  | 'competitive'
  | 'business_model'
  | 'local_sector';

export type ResearchTool = 'notebooklm' | 'claude' | 'perplexity' | 'manual';

/** Integer value from 1 (highest quality) to 8 (lowest quality). */
export type QualityTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type ContextDocumentCategory =
  | 'service_description'
  | 'strategy'
  | 'process_model'
  | 'external_source'
  | 'regulatory'
  | 'previous_research';

export type FileType = 'pdf' | 'docx' | 'md' | 'url';

export type UserRole = 'viewer' | 'researcher' | 'admin';

export type TagType = 'system' | 'free';

export type ClonedChangedDimension = 'market' | 'domain' | 'sector';

export type ResearchStep = 'discovery' | 'analysis' | 'synthesis';

export type AIToolStatus = 'active' | 'inactive';

export type FreshnessStatus = 'fresh' | 'stale' | 'archived';

export type FreshnessAction = 'flag' | 'archive' | 'notify';

export type FreshnessNotifyTarget = 'uploader' | 'admins';

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'published'
  | 'archived'
  | 'login'
  | 'role_changed'
  | 'api_access'
  | 'source_validated'
  | 'trust_tier_changed'
  | 'file_uploaded'
  | 'api_key_created'
  | 'api_key_revoked';

export type ActivityTargetType =
  | 'research'
  | 'context_document'
  | 'prompt_template'
  | 'ai_tool_profile'
  | 'user'
  | 'taxonomy';

export type ActivityCategory = 'research' | 'admin' | 'auth' | 'system' | 'api';

export type ResearchOrigin = 'human' | 'agent' | 'hybrid';

export type ReviewStatus = 'none' | 'pending' | 'approved' | 'rejected';

export type ValidationStatus = 'unverified' | 'corroborated' | 'human_verified' | 'disputed';

export type ApiKeyPermission = 'read' | 'read_write' | 'admin';

/** Trust tier classification label for display. */
export type TrustTierClassification =
  | 'authoritative'
  | 'established'
  | 'standard'
  | 'unverified';

// -----------------------------------------------------------------------------
// Agent & API Identity
// -----------------------------------------------------------------------------

/** Identity metadata for an AI agent interacting with the platform. */
export interface AgentIdentity {
  agent_id: string;
  agent_name: string;
  agent_version: string;
  run_id: string;
}

// -----------------------------------------------------------------------------
// Core Entities
// -----------------------------------------------------------------------------

/** A geographic or regional market with optional hierarchy. */
export interface Market {
  id: string;
  name: string;
  code: string;
  parent_id: string | null;
}

/** A technology / capability domain. */
export interface Domain {
  id: string;
  name: string;
  code: string;
  description: string;
  /** Domain-specific default source list (e.g. analyst firms, publications). */
  default_sources: string[];
  /** Link to the corresponding entry in the ITQ service catalogue. */
  itq_service_catalogue_ref: string;
}

/** An industry vertical / sector. */
export interface Sector {
  id: string;
  name: string;
  code: string;
  /** Sector-specific regulations (e.g. "NEN 7510", "NIS2"). */
  relevant_regulations: string[];
}

/** A classification tag applied to research or context documents. */
export interface Tag {
  id: string;
  name: string;
  type: TagType;
}

/** A portal user. */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Domains this user is associated with. */
  domain_ids: string[];
  /** Business unit for cost attribution. */
  business_unit?: string;
  /** Optional monthly token budget (soft limit). */
  monthly_token_budget?: number;
}

// -----------------------------------------------------------------------------
// Context Documents
// -----------------------------------------------------------------------------

/** A supporting document that provides context to one or more research items. */
export interface ContextDocument {
  id: string;
  title: string;
  description: string;
  category: ContextDocumentCategory;
  /** Firebase Storage URL. */
  file_url: string;
  file_type: FileType;
  domain_ids: string[];
  market_ids: string[];
  sector_ids: string[];
  /** ISO 8601 date string. */
  valid_from: string;
  /** ISO 8601 date string. */
  valid_until: string;
  /** User id of the uploader. */
  uploaded_by: string;
  /** ISO 8601 date-time string. */
  updated_at: string;
  version: number;
  tag_ids: string[];
}

// -----------------------------------------------------------------------------
// Research — Nested Entities
// -----------------------------------------------------------------------------

/** A single source referenced within a Notebook. */
export interface Source {
  id: string;
  title: string;
  url: string;
  publisher: string;
  /** ISO 8601 date string. */
  publication_date: string;
  quality_tier: QualityTier;
  discovered_by: ResearchTool;
  notes: string;
  /** Validation lifecycle — starts as 'unverified', progresses via review. */
  validation_status: ValidationStatus;
  /** User ID or agent ID that performed the validation. */
  validated_by: string | null;
  /** ISO 8601 date-time string of when validation occurred. */
  validated_at: string | null;
  /** Free-text notes about the validation (e.g., corroboration evidence). */
  validation_notes: string;
}

/** A research notebook — one per analytical lens / theme. */
export interface Notebook {
  id: string;
  type: NotebookType;
  research_tool: ResearchTool;
  /** Initial discovery prompt used to seed the notebook. */
  discovery_prompt: string;
  /** Follow-up analysis prompts. */
  analysis_prompts: string[];
  sources: Source[];
  /** Markdown-formatted findings. */
  findings: string;
}

/** The dimensional axes along which a Research item is classified. */
export interface ResearchDimensions {
  markets: Market[];
  domains: Domain[];
  sectors: Sector[];
}

// -----------------------------------------------------------------------------
// Research — Top-level Entity
// -----------------------------------------------------------------------------

/** The primary research artefact in the portal. */
export interface Research {
  id: string;
  title: string;
  description: string;
  type: ResearchType;
  /** Points to the previous version of this research (null for new). */
  previous_version_id: string | null;
  /** Points to the research this was cloned from (null for new/refresh). */
  cloned_from_id: string | null;
  /** Which dimension changed when cloning (null for new/refresh). */
  cloned_changed_dimension: ClonedChangedDimension | null;
  status: ResearchStatus;
  output_format: OutputFormat;
  /** ISO 8601 date-time string. */
  created_at: string;
  /** ISO 8601 date-time string. */
  updated_at: string;
  /** ISO 8601 date-time string (null until published). */
  published_at: string | null;
  /** ISO 8601 date-time string. */
  expires_at: string | null;
  refresh_schedule: RefreshSchedule;
  /** ISO 8601 date string. */
  next_refresh_date: string | null;
  /** User id of the author. */
  author_id: string;
  /** User id of the reviewer (null if not yet assigned). */
  reviewer_id: string | null;
  dimensions: ResearchDimensions;
  tags: Tag[];
  context_documents: ContextDocument[];
  notebooks: Notebook[];
  /** Markdown-formatted synthesis across all notebooks. */
  synthesis: string;
  /** Markdown-formatted change log — populated on refresh. */
  change_log: string;
  /** Free-text assumptions captured during research. */
  assumptions: string[];
  /** Ids of related research items. */
  related_research_ids: string[];
  /** All version ids belonging to this research lineage. */
  version_ids: string[];
  /** Who created this entry: human, agent, or collaborative. */
  origin: ResearchOrigin;
  /** Identity of the agent that created/updated this (null for human origin). */
  agent_identity: AgentIdentity | null;
  /** IDs of research entries or sources used as input context (ISO 42001 traceability). */
  input_context: string[];
  /** Human oversight status for agent-contributed research. */
  review_status: ReviewStatus;
}

// -----------------------------------------------------------------------------
// Research Brief (Wizard Payload)
// -----------------------------------------------------------------------------

/** Payload produced by the research-request wizard. */
export interface ResearchBrief {
  title: string;
  requester_name: string;
  requester_role: string;
  /** ISO 8601 date string. */
  date: string;
  type: ResearchType;
  /** Research id used as the basis for refresh or clone (null for new). */
  reference_research_id: string | null;
  /** Which dimension changed when cloning (null for new/refresh). */
  changed_dimension: ClonedChangedDimension | null;
  market_ids: string[];
  domain_ids: string[];
  sector_ids: string[];
  /** The primary question this research should answer. */
  core_question: string;
  output_format: OutputFormat;
  /** Free-text explanation of why this research is needed. */
  context_description: string;
  refresh_schedule: RefreshSchedule;
  /** ISO 8601 date string. */
  deadline: string;
  context_document_ids: string[];
}

// -----------------------------------------------------------------------------
// Admin — Prompt Template System
// -----------------------------------------------------------------------------

/** A versioned prompt template for a research step + domain combination. */
export interface PromptTemplate {
  id: string;
  /** Domain ID or "_default" for the base template. */
  domain: string;
  research_step: ResearchStep;
  /** AI tool ID for tool-specific override, or null for the base template. */
  ai_tool: string | null;
  version: number;
  content: string;
  variables: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  previous_version_id: string | null;
}

/** An AI tool profile with wrapper templates and pricing config. */
export interface AIToolProfile {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: AIToolStatus;
  wrapper_prefix: string;
  wrapper_suffix: string;
  pricing_config: {
    input_cost_per_1k_tokens: number;
    output_cost_per_1k_tokens: number;
    currency: string;
  };
  recommended_steps: ResearchStep[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

/** Maps a domain + research step to a specific AI tool. */
export interface PromptAssignment {
  id: string;
  domain: string;
  research_step: ResearchStep;
  ai_tool_id: string;
  override_template_id: string | null;
  updated_by: string;
  updated_at: string;
}

// -----------------------------------------------------------------------------
// Admin — Context Library Governance
// -----------------------------------------------------------------------------

/** Classification and freshness rules for a context document category. */
export interface ContextRule {
  id: string;
  category: string;
  required_fields: string[];
  suggested_tags: string[];
  allowed_file_types: string[];
  max_file_size_mb: number;
  freshness_policy: {
    max_age_days: number;
    grace_period_days: number;
    action: FreshnessAction;
    notify_targets: FreshnessNotifyTarget[];
  };
  created_at: string;
  updated_at: string;
}

// -----------------------------------------------------------------------------
// Admin — Activity & Usage Logging
// -----------------------------------------------------------------------------

/** An audit trail entry for a system event. */
export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  actor: {
    user_id: string;
    display_name: string;
  };
  action: ActivityAction;
  target_type: ActivityTargetType;
  target_id: string;
  target_name: string;
  details: Record<string, unknown>;
  category: ActivityCategory;
}

/** A single API usage record for cost tracking. */
export interface ApiUsageEntry {
  id: string;
  timestamp: string;
  user_id: string;
  user_display_name: string;
  business_unit: string;
  ai_tool_id: string;
  research_id: string | null;
  research_step: ResearchStep;
  input_tokens: number;
  output_tokens: number;
  estimated_cost: number;
  currency: string;
  metadata: Record<string, unknown>;
}

// -----------------------------------------------------------------------------
// Agent API — API Keys
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Admin — App Settings
// -----------------------------------------------------------------------------

/** Platform-wide settings stored in Firestore (app-settings/global). */
export interface AppSettings {
  registrations_enabled: boolean;
  auto_register_domains: string[];
  default_role: UserRole;
  /** Firebase Storage URL for sidebar/header logo. */
  logo_url: string | null;
  /** Optional separate logo for the login page. */
  logo_login_url: string | null;
  /** Brand name shown next to the logo (defaults to "ITQ"). */
  brand_name: string;
}

/** An API key for agent or external system access. */
export interface ApiKey {
  id: string;
  /** Human-readable name, e.g. "researcher-agent-prod". */
  name: string;
  /** SHA-256 hash of the key. Plaintext is never stored. */
  key_hash: string;
  permissions: ApiKeyPermission;
  agent_identity: AgentIdentity;
  /** User ID of the admin who created this key. */
  created_by: string;
  /** ISO 8601 date-time string. */
  created_at: string;
  /** ISO 8601 date-time string of last API call using this key. */
  last_used_at: string | null;
  is_active: boolean;
  /** ISO 8601 date-time string. Null means no expiry. */
  expires_at: string | null;
}

// -----------------------------------------------------------------------------
// Agent API — File Attachments
// -----------------------------------------------------------------------------

/** A file stored in Firebase Storage and linked to a research entry. */
export interface FileAttachment {
  id: string;
  research_id: string;
  /** Source ID this file supports (null if general attachment). */
  source_id: string | null;
  file_name: string;
  /** MIME type, validated by magic bytes on upload. */
  file_type: string;
  /** Path in Firebase Storage bucket. */
  storage_path: string;
  download_url: string;
  size_bytes: number;
  /** User ID or agent ID of the uploader. */
  uploaded_by: string;
  /** ISO 8601 date-time string. */
  uploaded_at: string;
  origin: ResearchOrigin;
}
