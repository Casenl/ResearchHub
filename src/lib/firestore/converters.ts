/**
 * Firestore data converters for all entity types.
 * Handles Timestamp ↔ ISO string conversion so existing types remain unchanged.
 */

import {
  Timestamp,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
} from "firebase/firestore";

import type {
  Research,
  ContextDocument,
  User,
  PromptTemplate,
  AIToolProfile,
  PromptAssignment,
  ContextRule,
  ActivityLogEntry,
  ApiUsageEntry,
  Market,
  Domain,
  Sector,
  Tag,
} from "@/types";

// -----------------------------------------------------------------------------
// Timestamp helpers
// -----------------------------------------------------------------------------

/** Convert a Firestore Timestamp (or ISO string) to an ISO string. */
export function timestampToISO(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  return "";
}

/** Convert a Firestore Timestamp (or ISO string or null) to an ISO string or null. */
export function timestampToISOOrNull(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return timestampToISO(value);
}

// -----------------------------------------------------------------------------
// Generic converter factory
// -----------------------------------------------------------------------------

/**
 * Create a Firestore converter that passes data through as-is on write
 * and applies a transform function on read.
 */
function createConverter<T extends { id: string }>(
  fromFirestore: (id: string, data: DocumentData) => T
): FirestoreDataConverter<T> {
  return {
    toFirestore(item: T): DocumentData {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = item;
      return rest;
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot<DocumentData>,
      options?: SnapshotOptions
    ): T {
      const data = snapshot.data(options);
      return fromFirestore(snapshot.id, data);
    },
  };
}

// -----------------------------------------------------------------------------
// Taxonomy converters (for single-document { items: T[] } pattern)
// -----------------------------------------------------------------------------

export interface TaxonomyDoc<T> {
  items: T[];
}

export function parseTaxonomyDoc<T>(data: DocumentData): TaxonomyDoc<T> {
  return {
    items: (data.items ?? []) as T[],
  };
}

// -----------------------------------------------------------------------------
// Research converter
// -----------------------------------------------------------------------------

export const researchConverter: FirestoreDataConverter<Research> =
  createConverter<Research>((id, data) => ({
    id,
    title: data.title ?? "",
    description: data.description ?? "",
    type: data.type ?? "new",
    previous_version_id: data.previous_version_id ?? null,
    cloned_from_id: data.cloned_from_id ?? null,
    cloned_changed_dimension: data.cloned_changed_dimension ?? null,
    status: data.status ?? "draft",
    output_format: data.output_format ?? "factsheet",
    created_at: timestampToISO(data.created_at),
    updated_at: timestampToISO(data.updated_at),
    published_at: timestampToISOOrNull(data.published_at),
    expires_at: timestampToISOOrNull(data.expires_at),
    refresh_schedule: data.refresh_schedule ?? "ad_hoc",
    next_refresh_date: data.next_refresh_date ?? null,
    author_id: data.author_id ?? "",
    reviewer_id: data.reviewer_id ?? null,
    dimensions: data.dimensions ?? { markets: [], domains: [], sectors: [] },
    tags: data.tags ?? [],
    context_documents: data.context_documents ?? [],
    notebooks: data.notebooks ?? [],
    synthesis: data.synthesis ?? "",
    change_log: data.change_log ?? "",
    assumptions: data.assumptions ?? [],
    related_research_ids: data.related_research_ids ?? [],
    version_ids: data.version_ids ?? [],
    origin: data.origin ?? "human",
    agent_identity: data.agent_identity ?? null,
    input_context: data.input_context ?? [],
    review_status: data.review_status ?? "none",
  }));

// -----------------------------------------------------------------------------
// Context Document converter
// -----------------------------------------------------------------------------

export const contextDocumentConverter: FirestoreDataConverter<ContextDocument> =
  createConverter<ContextDocument>((id, data) => ({
    id,
    title: data.title ?? "",
    description: data.description ?? "",
    category: data.category ?? "external_source",
    file_url: data.file_url ?? "",
    file_type: data.file_type ?? "pdf",
    domain_ids: data.domain_ids ?? [],
    market_ids: data.market_ids ?? [],
    sector_ids: data.sector_ids ?? [],
    valid_from: data.valid_from ?? "",
    valid_until: data.valid_until ?? "",
    uploaded_by: data.uploaded_by ?? "",
    updated_at: timestampToISO(data.updated_at),
    version: data.version ?? 1,
    tag_ids: data.tag_ids ?? [],
  }));

// -----------------------------------------------------------------------------
// User converter
// -----------------------------------------------------------------------------

export const userConverter: FirestoreDataConverter<User> =
  createConverter<User>((id, data) => ({
    id,
    name: data.name ?? "",
    email: data.email ?? "",
    role: data.role ?? "viewer",
    domain_ids: data.domain_ids ?? [],
    business_unit: data.business_unit,
    monthly_token_budget: data.monthly_token_budget,
  }));

// -----------------------------------------------------------------------------
// Prompt Template converter
// -----------------------------------------------------------------------------

export const promptTemplateConverter: FirestoreDataConverter<PromptTemplate> =
  createConverter<PromptTemplate>((id, data) => ({
    id,
    domain: data.domain ?? "_default",
    research_step: data.research_step ?? "discovery",
    ai_tool: data.ai_tool ?? null,
    version: data.version ?? 1,
    content: data.content ?? "",
    variables: data.variables ?? [],
    is_active: data.is_active ?? true,
    created_by: data.created_by ?? "",
    created_at: timestampToISO(data.created_at),
    previous_version_id: data.previous_version_id ?? null,
  }));

// -----------------------------------------------------------------------------
// AI Tool Profile converter
// -----------------------------------------------------------------------------

export const aiToolProfileConverter: FirestoreDataConverter<AIToolProfile> =
  createConverter<AIToolProfile>((id, data) => ({
    id,
    name: data.name ?? "",
    description: data.description ?? "",
    icon: data.icon ?? "",
    status: data.status ?? "active",
    wrapper_prefix: data.wrapper_prefix ?? "",
    wrapper_suffix: data.wrapper_suffix ?? "",
    pricing_config: data.pricing_config ?? {
      input_cost_per_1k_tokens: 0,
      output_cost_per_1k_tokens: 0,
      currency: "EUR",
    },
    recommended_steps: data.recommended_steps ?? [],
    is_default: data.is_default ?? false,
    created_at: timestampToISO(data.created_at),
    updated_at: timestampToISO(data.updated_at),
  }));

// -----------------------------------------------------------------------------
// Prompt Assignment converter
// -----------------------------------------------------------------------------

export const promptAssignmentConverter: FirestoreDataConverter<PromptAssignment> =
  createConverter<PromptAssignment>((id, data) => ({
    id,
    domain: data.domain ?? "",
    research_step: data.research_step ?? "discovery",
    ai_tool_id: data.ai_tool_id ?? "",
    override_template_id: data.override_template_id ?? null,
    updated_by: data.updated_by ?? "",
    updated_at: timestampToISO(data.updated_at),
  }));

// -----------------------------------------------------------------------------
// Context Rule converter
// -----------------------------------------------------------------------------

export const contextRuleConverter: FirestoreDataConverter<ContextRule> =
  createConverter<ContextRule>((id, data) => ({
    id,
    category: data.category ?? "",
    required_fields: data.required_fields ?? [],
    suggested_tags: data.suggested_tags ?? [],
    allowed_file_types: data.allowed_file_types ?? [],
    max_file_size_mb: data.max_file_size_mb ?? 25,
    freshness_policy: data.freshness_policy ?? {
      max_age_days: 365,
      grace_period_days: 30,
      action: "flag",
      notify_targets: [],
    },
    created_at: timestampToISO(data.created_at),
    updated_at: timestampToISO(data.updated_at),
  }));

// -----------------------------------------------------------------------------
// Activity Log converter
// -----------------------------------------------------------------------------

export const activityLogConverter: FirestoreDataConverter<ActivityLogEntry> =
  createConverter<ActivityLogEntry>((id, data) => ({
    id,
    timestamp: timestampToISO(data.timestamp),
    actor: data.actor ?? { user_id: "", display_name: "" },
    action: data.action ?? "created",
    target_type: data.target_type ?? "research",
    target_id: data.target_id ?? "",
    target_name: data.target_name ?? "",
    details: data.details ?? {},
    category: data.category ?? "system",
  }));

// -----------------------------------------------------------------------------
// API Usage converter
// -----------------------------------------------------------------------------

export const apiUsageConverter: FirestoreDataConverter<ApiUsageEntry> =
  createConverter<ApiUsageEntry>((id, data) => ({
    id,
    timestamp: timestampToISO(data.timestamp),
    user_id: data.user_id ?? "",
    user_display_name: data.user_display_name ?? "",
    business_unit: data.business_unit ?? "",
    ai_tool_id: data.ai_tool_id ?? "",
    research_id: data.research_id ?? null,
    research_step: data.research_step ?? "discovery",
    input_tokens: data.input_tokens ?? 0,
    output_tokens: data.output_tokens ?? 0,
    estimated_cost: data.estimated_cost ?? 0,
    currency: data.currency ?? "EUR",
    metadata: data.metadata ?? {},
  }));

// -----------------------------------------------------------------------------
// Taxonomy item converters (for items within taxonomy docs)
// These are used to type-check items extracted from the { items: T[] } pattern.
// -----------------------------------------------------------------------------

export function parseMarket(data: DocumentData): Market {
  return {
    id: data.id ?? "",
    name: data.name ?? "",
    code: data.code ?? "",
    parent_id: data.parent_id ?? null,
  };
}

export function parseDomain(data: DocumentData): Domain {
  return {
    id: data.id ?? "",
    name: data.name ?? "",
    code: data.code ?? "",
    description: data.description ?? "",
    default_sources: data.default_sources ?? [],
    itq_service_catalogue_ref: data.itq_service_catalogue_ref ?? "",
  };
}

export function parseSector(data: DocumentData): Sector {
  return {
    id: data.id ?? "",
    name: data.name ?? "",
    code: data.code ?? "",
    relevant_regulations: data.relevant_regulations ?? [],
  };
}

export function parseTag(data: DocumentData): Tag {
  return {
    id: data.id ?? "",
    name: data.name ?? "",
    type: data.type ?? "system",
  };
}
