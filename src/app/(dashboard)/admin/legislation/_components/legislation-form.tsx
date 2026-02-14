"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Legislation, LegislationScope, Market, Sector } from "@/types";

// =============================================================================
// Types
// =============================================================================

export type LegislationFormData = Omit<
  Legislation,
  "id" | "created_at" | "updated_at" | "created_by"
>;

interface LegislationFormProps {
  initial?: Legislation | null;
  markets: Market[];
  sectors: Sector[];
  onSave: (data: LegislationFormData) => Promise<void>;
  onCancel: () => void;
}

const SCOPE_OPTIONS: { value: LegislationScope; label: string }[] = [
  { value: "national", label: "National" },
  { value: "eu", label: "EU" },
  { value: "international", label: "International" },
];

// =============================================================================
// Component
// =============================================================================

export function LegislationForm({
  initial,
  markets,
  sectors,
  onSave,
  onCancel,
}: LegislationFormProps): React.JSX.Element {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [selectedMarketIds, setSelectedMarketIds] = useState<string[]>(
    initial?.market_ids ?? []
  );
  const [selectedSectorIds, setSelectedSectorIds] = useState<string[]>(
    initial?.sector_ids ?? []
  );
  const [scope, setScope] = useState<LegislationScope>(
    initial?.scope ?? "national"
  );
  const [effectiveDate, setEffectiveDate] = useState(
    initial?.effective_date ?? ""
  );
  const [enforcementAuthority, setEnforcementAuthority] = useState(
    initial?.enforcement_authority ?? ""
  );
  const [complianceDeadline, setComplianceDeadline] = useState(
    initial?.compliance_deadline ?? ""
  );
  const [contextDocumentId, setContextDocumentId] = useState(
    initial?.context_document_id ?? ""
  );
  const [url, setUrl] = useState(initial?.url ?? "");
  const [tagsInput, setTagsInput] = useState(
    (initial?.tags ?? []).join(", ")
  );
  const [isSaving, setIsSaving] = useState(false);

  const toggleId = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    id: string
  ) => {
    setList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        name,
        description,
        market_ids: selectedMarketIds,
        sector_ids: selectedSectorIds,
        scope,
        effective_date: effectiveDate,
        enforcement_authority: enforcementAuthority,
        compliance_deadline: complianceDeadline || null,
        context_document_id: contextDocumentId || null,
        url: url || null,
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {initial ? "Edit Legislation" : "Add Legislation"}
        </CardTitle>
        <button
          onClick={onCancel}
          className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NEN 7510"
              required
              maxLength={300}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the legislation..."
              rows={3}
              maxLength={5000}
            />
          </div>

          {/* Scope */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Scope <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-3">
              {SCOPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setScope(opt.value)}
                  className={cn(
                    "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                    scope === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Markets */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Markets <span className="text-destructive">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {markets.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    toggleId(selectedMarketIds, setSelectedMarketIds, m.id)
                  }
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                    selectedMarketIds.includes(m.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  )}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sectors */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Sectors <span className="text-destructive">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {sectors.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    toggleId(selectedSectorIds, setSelectedSectorIds, s.id)
                  }
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                    selectedSectorIds.includes(s.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Effective Date <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Compliance Deadline
              </label>
              <Input
                type="date"
                value={complianceDeadline}
                onChange={(e) => setComplianceDeadline(e.target.value)}
              />
            </div>
          </div>

          {/* Enforcement Authority */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Enforcement Authority
            </label>
            <Input
              value={enforcementAuthority}
              onChange={(e) => setEnforcementAuthority(e.target.value)}
              placeholder="e.g. Dutch Healthcare Inspectorate (IGJ)"
              maxLength={300}
            />
          </div>

          {/* URL */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Official URL
            </label>
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* Context Document ID */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Context Document ID
            </label>
            <Input
              value={contextDocumentId}
              onChange={(e) => setContextDocumentId(e.target.value)}
              placeholder="Optional — link to a Context Library document"
              maxLength={100}
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Tags</label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Comma-separated tags"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSaving ||
                !name.trim() ||
                !effectiveDate ||
                selectedMarketIds.length === 0 ||
                selectedSectorIds.length === 0
              }
            >
              {isSaving
                ? "Saving..."
                : initial
                  ? "Update"
                  : "Create"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
