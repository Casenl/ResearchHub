/**
 * Default context document classification rules and freshness policies.
 */

import type { ContextRule } from "@/types";

export const DEFAULT_CONTEXT_RULES: ContextRule[] = [
  {
    id: "rule-service-desc",
    category: "service_description",
    required_fields: ["title", "domain_ids"],
    suggested_tags: ["itq-internal", "service-catalogue"],
    allowed_file_types: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/markdown"],
    max_file_size_mb: 25,
    freshness_policy: {
      max_age_days: 365,
      grace_period_days: 30,
      action: "flag",
      notify_targets: ["uploader"],
    },
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "rule-strategy",
    category: "strategy",
    required_fields: ["title", "domain_ids", "valid_from", "valid_until"],
    suggested_tags: ["itq-internal", "confidential"],
    allowed_file_types: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    max_file_size_mb: 50,
    freshness_policy: {
      max_age_days: 180,
      grace_period_days: 30,
      action: "notify",
      notify_targets: ["uploader", "admins"],
    },
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "rule-process-model",
    category: "process_model",
    required_fields: ["title", "domain_ids"],
    suggested_tags: ["itq-internal", "process"],
    allowed_file_types: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/markdown"],
    max_file_size_mb: 25,
    freshness_policy: {
      max_age_days: 365,
      grace_period_days: 60,
      action: "flag",
      notify_targets: ["uploader"],
    },
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "rule-external-source",
    category: "external_source",
    required_fields: ["title", "domain_ids", "market_ids", "valid_from"],
    suggested_tags: ["external"],
    allowed_file_types: ["application/pdf", "text/markdown"],
    max_file_size_mb: 100,
    freshness_policy: {
      max_age_days: 180,
      grace_period_days: 14,
      action: "archive",
      notify_targets: ["admins"],
    },
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "rule-regulatory",
    category: "regulatory",
    required_fields: ["title", "market_ids", "sector_ids", "valid_from"],
    suggested_tags: ["regulation", "compliance"],
    allowed_file_types: ["application/pdf"],
    max_file_size_mb: 100,
    freshness_policy: {
      max_age_days: 365,
      grace_period_days: 90,
      action: "notify",
      notify_targets: ["admins"],
    },
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "rule-previous-research",
    category: "previous_research",
    required_fields: ["title", "domain_ids", "market_ids"],
    suggested_tags: ["research-archive"],
    allowed_file_types: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/markdown"],
    max_file_size_mb: 50,
    freshness_policy: {
      max_age_days: 270,
      grace_period_days: 30,
      action: "flag",
      notify_targets: ["uploader"],
    },
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
  },
];

export function getRuleByCategory(category: string): ContextRule | undefined {
  return DEFAULT_CONTEXT_RULES.find((r) => r.category === category);
}
