"use client";

import React, { useState } from "react";
import { Edit, Save, X, Search, Brain, Notebook } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RESEARCH_STEP_LABELS } from "@/lib/constants";

import type { AIToolProfile, ResearchStep } from "@/types";

// =============================================================================
// Props
// =============================================================================

interface AIToolCardProps {
  tool: AIToolProfile;
  onSave: (updated: AIToolProfile) => void;
}

// =============================================================================
// Icon mapping
// =============================================================================

const TOOL_ICONS: Record<string, React.ElementType> = {
  search: Search,
  brain: Brain,
  notebook: Notebook,
};

// =============================================================================
// AIToolCard
// =============================================================================

export function AIToolCard({ tool, onSave }: AIToolCardProps): React.JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AIToolProfile>({ ...tool });

  const Icon = TOOL_ICONS[tool.icon] ?? Brain;

  const handleSave = (): void => {
    onSave({ ...form, updated_at: new Date().toISOString() });
    setIsEditing(false);
  };

  const handleCancel = (): void => {
    setForm({ ...tool });
    setIsEditing(false);
  };

  const toggleStep = (step: ResearchStep): void => {
    setForm((prev) => ({
      ...prev,
      recommended_steps: prev.recommended_steps.includes(step)
        ? prev.recommended_steps.filter((s) => s !== step)
        : [...prev.recommended_steps, step],
    }));
  };

  if (isEditing) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Editing: {tool.name}</h4>
          <div className="flex gap-1">
            <Button size="sm" onClick={handleSave}><Save className="h-4 w-4" />Save</Button>
            <Button size="sm" variant="outline" onClick={handleCancel}><X className="h-4 w-4" />Cancel</Button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Description</label>
          <Textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Default Tool</label>
            <select
              value={form.is_default ? "yes" : "no"}
              onChange={(e) => setForm({ ...form, is_default: e.target.value === "yes" })}
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Wrapper Prefix</label>
          <Textarea rows={2} value={form.wrapper_prefix} onChange={(e) => setForm({ ...form, wrapper_prefix: e.target.value })} className="font-mono text-xs" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Wrapper Suffix</label>
          <Textarea rows={2} value={form.wrapper_suffix} onChange={(e) => setForm({ ...form, wrapper_suffix: e.target.value })} className="font-mono text-xs" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Input cost / 1k tokens</label>
            <Input type="number" step="0.0001" value={form.pricing_config.input_cost_per_1k_tokens} onChange={(e) => setForm({ ...form, pricing_config: { ...form.pricing_config, input_cost_per_1k_tokens: parseFloat(e.target.value) || 0 } })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Output cost / 1k tokens</label>
            <Input type="number" step="0.0001" value={form.pricing_config.output_cost_per_1k_tokens} onChange={(e) => setForm({ ...form, pricing_config: { ...form.pricing_config, output_cost_per_1k_tokens: parseFloat(e.target.value) || 0 } })} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Recommended Steps</label>
          <div className="flex gap-2">
            {(Object.entries(RESEARCH_STEP_LABELS) as [ResearchStep, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => toggleStep(key)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  form.recommended_steps.includes(key)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-background p-5 space-y-4 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{tool.name}</h3>
            <p className="text-xs text-muted-foreground">{tool.description}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} title="Edit">
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      {/* Status + Default badges */}
      <div className="flex items-center gap-2">
        <Badge variant={tool.status === "active" ? "success" : "warning"}>
          {tool.status === "active" ? "Active" : "Inactive"}
        </Badge>
        {tool.is_default && <Badge variant="info">Default</Badge>}
      </div>

      {/* Wrapper preview */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Wrapper</p>
        <div className="rounded-md bg-muted/50 p-2.5 font-mono text-xs leading-relaxed text-muted-foreground">
          <span className="text-green-700">{tool.wrapper_prefix.slice(0, 80)}</span>
          {tool.wrapper_prefix.length > 80 && <span className="text-muted-foreground">...</span>}
          <span className="mx-1 text-foreground">[prompt]</span>
          <span className="text-blue-700">{tool.wrapper_suffix.slice(0, 60)}</span>
          {tool.wrapper_suffix.length > 60 && <span className="text-muted-foreground">...</span>}
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md bg-muted/40 p-2.5">
          <p className="text-xs text-muted-foreground">Input / 1k tokens</p>
          <p className="text-sm font-semibold">
            {tool.pricing_config.currency} {tool.pricing_config.input_cost_per_1k_tokens.toFixed(4)}
          </p>
        </div>
        <div className="rounded-md bg-muted/40 p-2.5">
          <p className="text-xs text-muted-foreground">Output / 1k tokens</p>
          <p className="text-sm font-semibold">
            {tool.pricing_config.currency} {tool.pricing_config.output_cost_per_1k_tokens.toFixed(4)}
          </p>
        </div>
      </div>

      {/* Recommended steps */}
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Recommended for
        </p>
        <div className="flex flex-wrap gap-1.5">
          {tool.recommended_steps.map((step) => (
            <Badge key={step} variant="secondary">
              {RESEARCH_STEP_LABELS[step]}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
