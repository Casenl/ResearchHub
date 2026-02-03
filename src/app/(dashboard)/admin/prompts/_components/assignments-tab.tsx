"use client";

import React, { useState, useMemo } from "react";

import { cn } from "@/lib/utils";
import { RESEARCH_STEP_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { DOMAINS } from "@/data/domains";
import { AI_TOOL_PROFILES } from "@/data/ai-tool-profiles";

import { useToast } from "./use-toast";

import type { PromptAssignment, ResearchStep } from "@/types";

// =============================================================================
// Types
// =============================================================================

interface AssignmentKey {
  domain: string;
  step: ResearchStep;
}

// =============================================================================
// Initial seed: build default assignments from AI_TOOL_PROFILES
// =============================================================================

const STEPS: ResearchStep[] = ["discovery", "analysis", "synthesis"];

const ROW_DOMAINS = [
  { id: "_default", name: "Default (fallback)" },
  ...DOMAINS.map((d) => ({ id: d.id, name: d.name })),
];

function buildInitialAssignments(): Map<string, string> {
  const map = new Map<string, string>();
  const defaultTool = AI_TOOL_PROFILES.find((t) => t.is_default);
  const defaultToolId = defaultTool?.id ?? AI_TOOL_PROFILES[0]?.id ?? "";

  for (const domain of ROW_DOMAINS) {
    for (const step of STEPS) {
      const key = `${domain.id}::${step}`;
      // Find the tool that recommends this step
      const recommended = AI_TOOL_PROFILES.find(
        (t) => t.status === "active" && t.recommended_steps.includes(step)
      );
      map.set(key, recommended?.id ?? defaultToolId);
    }
  }
  return map;
}

// =============================================================================
// AssignmentsTab
// =============================================================================

export function AssignmentsTab(): React.JSX.Element {
  const [assignments, setAssignments] = useState<Map<string, string>>(buildInitialAssignments);
  const { show, Toast } = useToast();

  const activeTools = useMemo(
    () => AI_TOOL_PROFILES.filter((t) => t.status === "active"),
    []
  );

  const handleChange = (domain: string, step: ResearchStep, toolId: string): void => {
    const key = `${domain}::${step}`;
    setAssignments((prev) => {
      const next = new Map(prev);
      next.set(key, toolId);
      return next;
    });
    const toolName = AI_TOOL_PROFILES.find((t) => t.id === toolId)?.name ?? toolId;
    const domainName = ROW_DOMAINS.find((d) => d.id === domain)?.name ?? domain;
    show(`${domainName} / ${RESEARCH_STEP_LABELS[step]} assigned to ${toolName}`);
  };

  const getToolId = (domain: string, step: ResearchStep): string => {
    return assignments.get(`${domain}::${step}`) ?? "";
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <p className="text-sm text-muted-foreground">
        Map each domain and research step to a specific AI tool.
        The &ldquo;Default&rdquo; row is the fallback when no domain-specific assignment exists.
      </p>

      {/* Fallback chain */}
      <div className="rounded-md border border-blue-200 bg-blue-50/50 px-4 py-3">
        <p className="text-xs font-semibold text-blue-800">Resolution Order</p>
        <ol className="mt-1 list-inside list-decimal text-xs text-blue-700 space-y-0.5">
          <li>Domain + Step specific assignment (rows below)</li>
          <li>Default row for this step</li>
          <li>Tool wrapper applied around base template</li>
        </ol>
      </div>

      {/* Matrix table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground min-w-[180px]">
                Domain
              </th>
              {STEPS.map((step) => (
                <th
                  key={step}
                  className="px-4 py-3 text-center font-medium text-muted-foreground min-w-[160px]"
                >
                  {RESEARCH_STEP_LABELS[step]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROW_DOMAINS.map((domain, idx) => {
              const isDefault = domain.id === "_default";
              return (
                <tr
                  key={domain.id}
                  className={cn(
                    "border-b border-border transition-colors",
                    isDefault
                      ? "bg-amber-50/40"
                      : idx % 2 === 0
                      ? "bg-background"
                      : "bg-muted/10"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-medium", isDefault && "italic text-amber-800")}>
                        {domain.name}
                      </span>
                      {isDefault && (
                        <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                          Fallback
                        </Badge>
                      )}
                    </div>
                  </td>
                  {STEPS.map((step) => (
                    <td key={step} className="px-4 py-3 text-center">
                      <select
                        value={getToolId(domain.id, step)}
                        onChange={(e) => handleChange(domain.id, step, e.target.value)}
                        className={cn(
                          "mx-auto h-9 w-full max-w-[150px] rounded-md border border-border bg-background px-2 py-1 text-xs font-medium transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          "hover:border-primary/40"
                        )}
                      >
                        {activeTools.map((tool) => (
                          <option key={tool.id} value={tool.id}>
                            {tool.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {activeTools.map((tool) => (
          <div key={tool.id} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-medium">{tool.name}</span>
            <span>
              &mdash; {tool.recommended_steps.map((s) => RESEARCH_STEP_LABELS[s]).join(", ")}
            </span>
          </div>
        ))}
      </div>

      {Toast}
    </div>
  );
}
