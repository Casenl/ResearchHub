"use client";

import { useMemo } from "react";

import { MOCK_API_USAGE } from "@/data/mock-usage";
import { AI_TOOL_PROFILES } from "@/data/ai-tool-profiles";

import type { UsageView } from "./usage-view-toggle";

// ---------------------------------------------------------------------------
// Aggregated row shape
// ---------------------------------------------------------------------------

export interface AggregatedRow {
  key: string;
  label: string;
  sublabel?: string;
  tokens: number;
  cost: number;
  calls: number;
}

// ---------------------------------------------------------------------------
// Aggregation functions
// ---------------------------------------------------------------------------

function aggregateByBU(): AggregatedRow[] {
  const map = new Map<string, AggregatedRow>();
  for (const entry of MOCK_API_USAGE) {
    const existing = map.get(entry.business_unit);
    if (existing) {
      existing.tokens += entry.input_tokens + entry.output_tokens;
      existing.cost += entry.estimated_cost;
      existing.calls += 1;
    } else {
      map.set(entry.business_unit, {
        key: entry.business_unit,
        label: entry.business_unit,
        tokens: entry.input_tokens + entry.output_tokens,
        cost: entry.estimated_cost,
        calls: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.cost - a.cost);
}

function aggregateByTool(): AggregatedRow[] {
  const map = new Map<string, AggregatedRow>();
  for (const entry of MOCK_API_USAGE) {
    const existing = map.get(entry.ai_tool_id);
    const toolName =
      AI_TOOL_PROFILES.find((t) => t.id === entry.ai_tool_id)?.name ?? entry.ai_tool_id;
    if (existing) {
      existing.tokens += entry.input_tokens + entry.output_tokens;
      existing.cost += entry.estimated_cost;
      existing.calls += 1;
    } else {
      map.set(entry.ai_tool_id, {
        key: entry.ai_tool_id,
        label: toolName,
        tokens: entry.input_tokens + entry.output_tokens,
        cost: entry.estimated_cost,
        calls: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.cost - a.cost);
}

function aggregateByUser(): AggregatedRow[] {
  const map = new Map<string, AggregatedRow>();
  for (const entry of MOCK_API_USAGE) {
    const existing = map.get(entry.user_id);
    if (existing) {
      existing.tokens += entry.input_tokens + entry.output_tokens;
      existing.cost += entry.estimated_cost;
      existing.calls += 1;
    } else {
      map.set(entry.user_id, {
        key: entry.user_id,
        label: entry.user_display_name,
        sublabel: entry.business_unit,
        tokens: entry.input_tokens + entry.output_tokens,
        cost: entry.estimated_cost,
        calls: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.cost - a.cost);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useUsageAggregation(view: UsageView): AggregatedRow[] {
  return useMemo(() => {
    switch (view) {
      case "by-bu":
        return aggregateByBU();
      case "by-tool":
        return aggregateByTool();
      case "by-user":
        return aggregateByUser();
    }
  }, [view]);
}
