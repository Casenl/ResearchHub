/**
 * Default AI tool profiles for the ITQ Market Intelligence Portal.
 * These provide out-of-the-box configurations for each supported AI tool.
 */

import type { AIToolProfile } from "@/types";

export const AI_TOOL_PROFILES: AIToolProfile[] = [
  {
    id: "tool-perplexity",
    name: "Perplexity",
    description:
      "AI-powered search engine ideal for source discovery and fact-finding with built-in citations.",
    icon: "search",
    status: "active",
    wrapper_prefix:
      "Search the web for the most recent and authoritative sources. Provide citations for every claim. ",
    wrapper_suffix:
      "\n\nFor each source found, include: title, publisher, publication date, URL, and a one-line credibility assessment.",
    pricing_config: {
      input_cost_per_1k_tokens: 0.001,
      output_cost_per_1k_tokens: 0.005,
      currency: "EUR",
    },
    recommended_steps: ["discovery"],
    is_default: false,
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "tool-claude",
    name: "Claude",
    description:
      "Advanced reasoning model for deep analysis, synthesis, and structured output generation.",
    icon: "brain",
    status: "active",
    wrapper_prefix:
      "You are an expert market intelligence analyst at ITQ. Provide thorough, evidence-based analysis. ",
    wrapper_suffix:
      "\n\nStructure your response with clear headers, cite sources inline, and flag any estimates or assumptions explicitly.",
    pricing_config: {
      input_cost_per_1k_tokens: 0.003,
      output_cost_per_1k_tokens: 0.015,
      currency: "EUR",
    },
    recommended_steps: ["analysis", "synthesis"],
    is_default: true,
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "tool-notebooklm",
    name: "NotebookLM",
    description:
      "Document-grounded AI for analysing uploaded sources. Best for sector deep-dives with curated source sets.",
    icon: "notebook",
    status: "active",
    wrapper_prefix:
      "Using only the provided sources and uploaded documents, analyse the following. Do not introduce external information. ",
    wrapper_suffix:
      "\n\nClearly indicate which source supports each finding. If the sources are insufficient to answer, state what additional information is needed.",
    pricing_config: {
      input_cost_per_1k_tokens: 0.0005,
      output_cost_per_1k_tokens: 0.002,
      currency: "EUR",
    },
    recommended_steps: ["analysis"],
    is_default: false,
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
  },
];

export function getAIToolById(id: string): AIToolProfile | undefined {
  return AI_TOOL_PROFILES.find((tool) => tool.id === id);
}

export function getDefaultAITool(): AIToolProfile | undefined {
  return AI_TOOL_PROFILES.find((tool) => tool.is_default);
}

export function getActiveAITools(): AIToolProfile[] {
  return AI_TOOL_PROFILES.filter((tool) => tool.status === "active");
}
