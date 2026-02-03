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
