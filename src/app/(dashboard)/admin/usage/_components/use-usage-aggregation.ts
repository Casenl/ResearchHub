"use client";

import { useMemo } from "react";

import { useApiUsage } from "@/hooks/use-usage";
import { useAIToolProfiles } from "@/hooks/use-admin-data";

import type { ApiUsageEntry, AIToolProfile } from "@/types";
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

function aggregateByBU(entries: ApiUsageEntry[]): AggregatedRow[] {
  const map = new Map<string, AggregatedRow>();
  for (const entry of entries) {
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

function aggregateByTool(entries: ApiUsageEntry[], toolProfiles: AIToolProfile[]): AggregatedRow[] {
  const map = new Map<string, AggregatedRow>();
  for (const entry of entries) {
    const existing = map.get(entry.ai_tool_id);
    const toolName =
      toolProfiles.find((t) => t.id === entry.ai_tool_id)?.name ?? entry.ai_tool_id;
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

function aggregateByUser(entries: ApiUsageEntry[]): AggregatedRow[] {
  const map = new Map<string, AggregatedRow>();
  for (const entry of entries) {
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
  const { data: usageData } = useApiUsage();
  const { data: toolProfiles } = useAIToolProfiles();

  return useMemo(() => {
    switch (view) {
      case "by-bu":
        return aggregateByBU(usageData);
      case "by-tool":
        return aggregateByTool(usageData, toolProfiles);
      case "by-user":
        return aggregateByUser(usageData);
    }
  }, [view, usageData, toolProfiles]);
}
