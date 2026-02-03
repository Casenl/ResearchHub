"use client";

import React, { useState, useMemo } from "react";
import { Save, X, Eye, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { RESEARCH_STEP_LABELS } from "@/lib/constants";
import { useDomains } from "@/hooks/use-taxonomy";

import type { PromptTemplate, ResearchStep } from "@/types";

// =============================================================================
// Props
// =============================================================================

interface TemplateEditorProps {
  template: PromptTemplate | null;
  onSave: (template: PromptTemplate) => void;
  onCancel: () => void;
}

// =============================================================================
// Sample data for preview rendering
// =============================================================================

const SAMPLE_DATA: Record<string, string> = {
  yearRange: "2025-2026",
  geography: "Netherlands",
  domain: "Security",
  sectors: "Healthcare, Financial Services",
  title: "Dutch Security Market Analysis",
  coreQuestion: "What is the MSS market opportunity in the Netherlands?",
};

// =============================================================================
// TemplateEditor
// =============================================================================

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps): React.JSX.Element {
  const { data: domains } = useDomains();
  const [content, setContent] = useState(template?.content ?? "");
  const [domainValue, setDomainValue] = useState(template?.domain ?? "_default");
  const [step, setStep] = useState<ResearchStep>(template?.research_step ?? "discovery");
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const variables = useMemo(() => {
    const matches = content.match(/\{\{(\w+)\}\}/g) ?? [];
    return [...new Set(matches.map((m) => m.replace(/\{|\}/g, "")))];
  }, [content]);

  const previewContent = useMemo(() => {
    let result = content;
    for (const [key, value] of Object.entries(SAMPLE_DATA)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }
    return result;
  }, [content]);

  const domainLabel = domainValue === "_default"
    ? "Default"
    : domains.find((d) => d.id === domainValue)?.name ?? domainValue;

  const handleSave = (): void => {
    if (!content.trim()) return;
    onSave({
      id: template?.id ?? "",
      domain: domainValue,
      research_step: step,
      ai_tool: template?.ai_tool ?? null,
      version: (template?.version ?? 0) + 1,
      content,
      variables,
      is_active: true,
      created_by: template?.created_by ?? "admin",
      created_at: template?.created_at ?? new Date().toISOString(),
      previous_version_id: template?.id ?? null,
    });
  };

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">
          {template ? `Edit Template (v${template.version})` : "New Template"}
        </h4>
        <div className="flex items-center gap-1.5">
          <Badge variant="info">{domainLabel}</Badge>
          <Badge variant="secondary">{RESEARCH_STEP_LABELS[step]}</Badge>
        </div>
      </div>

      {/* Domain + Step selectors */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Domain</label>
          <select
            value={domainValue}
            onChange={(e) => setDomainValue(e.target.value)}
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="_default">Default (all domains)</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Research Step</label>
          <select
            value={step}
            onChange={(e) => setStep(e.target.value as ResearchStep)}
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {(Object.entries(RESEARCH_STEP_LABELS) as [ResearchStep, string][]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Template content */}
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Prompt Content
        </label>
        <Textarea
          rows={8}
          placeholder="Enter your prompt template. Use {{variableName}} for interpolation..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="font-mono text-xs leading-relaxed"
        />
      </div>

      {/* Variables display */}
      {variables.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            Detected Variables
          </p>
          <div className="flex flex-wrap gap-1.5">
            {variables.map((v) => (
              <Badge key={v} variant="outline" className="font-mono text-xs">
                {`{{${v}}}`}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      {isPreviewVisible && (
        <div className="rounded-md border border-blue-200 bg-blue-50/50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
            Preview (sample data)
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-blue-900">
            {previewContent}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSave}>
          <Save className="h-4 w-4" />
          {template ? "Update" : "Save"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsPreviewVisible(!isPreviewVisible)}
        >
          <Eye className="h-4 w-4" />
          {isPreviewVisible ? "Hide Preview" : "Preview"}
        </Button>
        {template && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setContent(template.content)}
            title="Reset to saved version"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
