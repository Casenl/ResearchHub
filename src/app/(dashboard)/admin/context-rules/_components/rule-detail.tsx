"use client";

import React, { useState } from "react";

import { Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import type { ContextRule } from "@/types";

interface RuleDetailProps {
  rule: ContextRule;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (rule: ContextRule) => void;
}

/** Shorten MIME types for display. */
function shortenMime(mime: string): string {
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("wordprocessingml")) return "DOCX";
  if (mime.includes("markdown") || mime === "text/markdown") return "Markdown";
  return mime;
}

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function EditField({ label, value, onChange, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

// =============================================================================
// Rule Detail (expanded view with optional edit mode)
// =============================================================================

export function RuleDetail({ rule, isEditing, onCancelEdit, onSave }: RuleDetailProps): React.JSX.Element {
  const [draft, setDraft] = useState<ContextRule>({ ...rule });

  const handleFieldChange = (field: keyof ContextRule, value: unknown) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setDraft({ ...rule });
    onCancelEdit();
  };

  if (!isEditing) {
    return (
      <div className="grid gap-5 px-5 py-4 sm:grid-cols-2">
        <DetailField label="Required Fields">
          <div className="flex flex-wrap gap-1.5">
            {rule.required_fields.map((f) => (
              <Badge key={f} variant="info" className="text-[11px]">{f}</Badge>
            ))}
          </div>
        </DetailField>
        <DetailField label="Suggested Tags">
          <div className="flex flex-wrap gap-1.5">
            {rule.suggested_tags.map((t) => (
              <Badge key={t} variant="secondary" className="text-[11px]">{t}</Badge>
            ))}
          </div>
        </DetailField>
        <DetailField label="Allowed File Types">
          <div className="flex flex-wrap gap-1.5">
            {rule.allowed_file_types.map((ft) => (
              <Badge key={ft} variant="outline" className="text-[11px]">{shortenMime(ft)}</Badge>
            ))}
          </div>
        </DetailField>
        <DetailField label="Max File Size">
          <span className="text-sm font-medium">{rule.max_file_size_mb} MB</span>
        </DetailField>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-5 py-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <EditField
          label="Required Fields (comma-separated)"
          value={draft.required_fields.join(", ")}
          onChange={(v) => handleFieldChange("required_fields", v.split(",").map((s) => s.trim()).filter(Boolean))}
        />
        <EditField
          label="Suggested Tags (comma-separated)"
          value={draft.suggested_tags.join(", ")}
          onChange={(v) => handleFieldChange("suggested_tags", v.split(",").map((s) => s.trim()).filter(Boolean))}
        />
        <EditField
          label="Allowed File Types (comma-separated MIME)"
          value={draft.allowed_file_types.join(", ")}
          onChange={(v) => handleFieldChange("allowed_file_types", v.split(",").map((s) => s.trim()).filter(Boolean))}
        />
        <EditField
          label="Max File Size (MB)"
          value={String(draft.max_file_size_mb)}
          onChange={(v) => handleFieldChange("max_file_size_mb", Number(v) || 0)}
          type="number"
        />
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <X className="h-3.5 w-3.5" />
          Cancel
        </Button>
        <Button size="sm" onClick={() => onSave(draft)}>
          <Save className="h-3.5 w-3.5" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
