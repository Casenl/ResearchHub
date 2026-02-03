/**
 * Default prompt templates for the ITQ Market Intelligence Portal.
 * These serve as base templates with {{variable}} interpolation.
 */

import type { PromptTemplate } from "@/types";

export const DEFAULT_PROMPT_TEMPLATES: PromptTemplate[] = [
  // ── Discovery defaults ───────────────────────────────────────────────
  {
    id: "tpl-default-discovery",
    domain: "_default",
    research_step: "discovery",
    ai_tool: null,
    version: 1,
    content:
      "Find recent ({{yearRange}}) high-quality sources about the {{geography}} {{domain}} market. Prioritise government/EU reports, independent annual reports, and analyst research. Exclude vendor marketing materials. For each source found, state: title, publisher, publication date, and a one-line credibility assessment.",
    variables: ["yearRange", "geography", "domain"],
    is_active: true,
    created_by: "system",
    created_at: "2026-01-15T10:00:00Z",
    previous_version_id: null,
  },

  // ── Analysis defaults ────────────────────────────────────────────────
  {
    id: "tpl-default-analysis",
    domain: "_default",
    research_step: "analysis",
    ai_tool: null,
    version: 1,
    content:
      "Based on the provided sources, analyse the {{domain}} market in {{geography}}. Cover: market sizing (TAM, SAM, CAGR), segmentation by service type and deployment model, regulatory landscape as demand driver, and technology trends. Cite specific sources for every data point. Mark estimates as [ESTIMATE].",
    variables: ["domain", "geography"],
    is_active: true,
    created_by: "system",
    created_at: "2026-01-15T10:00:00Z",
    previous_version_id: null,
  },

  // ── Synthesis defaults ───────────────────────────────────────────────
  {
    id: "tpl-default-synthesis",
    domain: "_default",
    research_step: "synthesis",
    ai_tool: null,
    version: 1,
    content:
      "Synthesise research findings for: {{title}}.\nDomain: {{domain}} | Geography: {{geography}} | Sectors: {{sectors}}\nCore Question: {{coreQuestion}}\n\nCross-reference findings across all notebooks. Identify the top 5 strategic insights for ITQ ranked by actionability. For each insight provide: finding, supporting evidence, confidence level (High/Medium/Low), and recommended action.",
    variables: [
      "title",
      "domain",
      "geography",
      "sectors",
      "coreQuestion",
    ],
    is_active: true,
    created_by: "system",
    created_at: "2026-01-15T10:00:00Z",
    previous_version_id: null,
  },

  // ── Domain-specific: Security discovery ──────────────────────────────
  {
    id: "tpl-sec-discovery",
    domain: "domain-sec",
    research_step: "discovery",
    ai_tool: null,
    version: 1,
    content:
      "Find recent ({{yearRange}}) high-quality sources about the {{geography}} Security market. Specifically looking for: ENISA MSS Market Analysis, NCSC Annual Review, Verizon DBIR, SANS Institute, ISACA, CrowdStrike Global Threat Report, Gartner Market Guide MDR. Exclude vendor marketing. For each source: title, publisher, publication date, credibility assessment.",
    variables: ["yearRange", "geography"],
    is_active: true,
    created_by: "system",
    created_at: "2026-01-15T10:00:00Z",
    previous_version_id: null,
  },

  // ── Domain-specific: Hybrid Cloud discovery ──────────────────────────
  {
    id: "tpl-hc-discovery",
    domain: "domain-hc",
    research_step: "discovery",
    ai_tool: null,
    version: 1,
    content:
      "Find recent ({{yearRange}}) high-quality sources about the {{geography}} Hybrid Cloud market. Looking for: Gartner MQ IaaS/PaaS, Flexera State of the Cloud, IDC Cloud Tracker, Uptime Institute, CISPE Reports. Exclude vendor marketing. For each source: title, publisher, publication date, credibility assessment.",
    variables: ["yearRange", "geography"],
    is_active: true,
    created_by: "system",
    created_at: "2026-01-15T10:00:00Z",
    previous_version_id: null,
  },

  // ── Domain-specific: AI Services discovery ───────────────────────────
  {
    id: "tpl-ai-discovery",
    domain: "domain-ai",
    research_step: "discovery",
    ai_tool: null,
    version: 1,
    content:
      "Find recent ({{yearRange}}) high-quality sources about the {{geography}} AI Services market. Looking for: Stanford AI Index, McKinsey State of AI, EU AI Act Impact Analyses, OECD AI Policy Observatory. Exclude vendor marketing. For each source: title, publisher, publication date, credibility assessment.",
    variables: ["yearRange", "geography"],
    is_active: true,
    created_by: "system",
    created_at: "2026-01-15T10:00:00Z",
    previous_version_id: null,
  },
];

export function getTemplatesForStep(
  step: string,
  domain?: string
): PromptTemplate[] {
  return DEFAULT_PROMPT_TEMPLATES.filter(
    (t) =>
      t.research_step === step &&
      t.is_active &&
      (domain ? t.domain === domain || t.domain === "_default" : true)
  );
}
