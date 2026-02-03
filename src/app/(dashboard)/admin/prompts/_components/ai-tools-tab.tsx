"use client";

import React from "react";

import { useAIToolProfiles } from "@/hooks/use-admin-data";

import { useToast } from "./use-toast";
import { AIToolCard } from "./ai-tool-card";

import type { AIToolProfile } from "@/types";

// =============================================================================
// AIToolsTab
// =============================================================================

export function AIToolsTab(): React.JSX.Element {
  const { data: tools, upsertTool } = useAIToolProfiles();
  const { show, Toast } = useToast();

  const handleSave = async (updated: AIToolProfile): Promise<void> => {
    // If updated tool is now the default, remove default from others
    if (updated.is_default) {
      for (const t of tools) {
        if (t.id !== updated.id && t.is_default) {
          await upsertTool({ ...t, is_default: false });
        }
      }
    }
    await upsertTool(updated);
    show(`${updated.name} profile updated`);
  };

  const activeCount = tools.filter((t) => t.status === "active").length;
  const defaultTool = tools.find((t) => t.is_default);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <p className="text-sm text-muted-foreground">
          {tools.length} tool{tools.length !== 1 ? "s" : ""} configured
          {" \u2022 "}
          {activeCount} active
        </p>
        {defaultTool && (
          <p className="text-xs text-muted-foreground">
            Default: <span className="font-medium text-foreground">{defaultTool.name}</span>
          </p>
        )}
      </div>

      {/* Fallback chain explanation */}
      <div className="rounded-md border border-amber-200 bg-amber-50/50 px-4 py-3">
        <p className="text-xs font-semibold text-amber-800">Prompt Resolution Chain</p>
        <p className="mt-1 text-xs text-amber-700">
          Tool + Domain override &rarr; Domain template &rarr; Default + wrapper &rarr; Base default template.
          Assignments in the next tab control which tool is used per domain and step.
        </p>
      </div>

      {/* Tool cards grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {tools.map((tool) => (
          <AIToolCard key={tool.id} tool={tool} onSave={handleSave} />
        ))}
      </div>

      {Toast}
    </div>
  );
}
