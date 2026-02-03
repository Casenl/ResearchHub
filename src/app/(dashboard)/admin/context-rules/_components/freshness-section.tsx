"use client";

import React, { useState } from "react";

import { Edit, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CONTEXT_CATEGORY_LABELS, FRESHNESS_ACTION_LABELS } from "@/lib/constants";

import type { ContextRule, FreshnessAction, FreshnessNotifyTarget } from "@/types";

// =============================================================================
// Props
// =============================================================================

interface FreshnessSectionProps {
  rules: ContextRule[];
  editingId: string | null;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onSaveRule: (rule: ContextRule) => void;
}

const ACTIONS: FreshnessAction[] = ["flag", "archive", "notify"];
const TARGETS: FreshnessNotifyTarget[] = ["uploader", "admins"];

// =============================================================================
// Freshness Policies Section
// =============================================================================

export function FreshnessSection({
  rules, editingId, onStartEdit, onCancelEdit, onSaveRule,
}: FreshnessSectionProps): React.JSX.Element {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Freshness Policies</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Automated staleness detection and action rules per document category
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Category", "Max Age", "Grace Period", "Action", "Notify", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rules.map((rule) => (
                  <FreshnessRow
                    key={rule.id}
                    rule={rule}
                    isEditing={editingId === rule.id}
                    onStartEdit={() => onStartEdit(rule.id)}
                    onCancelEdit={onCancelEdit}
                    onSave={onSaveRule}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

// =============================================================================
// Freshness Row (inline editable)
// =============================================================================

interface FreshnessRowProps {
  rule: ContextRule;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (rule: ContextRule) => void;
}

function FreshnessRow({ rule, isEditing, onStartEdit, onCancelEdit, onSave }: FreshnessRowProps): React.JSX.Element {
  const [draft, setDraft] = useState(rule.freshness_policy);
  const categoryLabel = CONTEXT_CATEGORY_LABELS[rule.category as keyof typeof CONTEXT_CATEGORY_LABELS] ?? rule.category;
  const actionVariant = rule.freshness_policy.action === "archive" ? "destructive"
    : rule.freshness_policy.action === "notify" ? "warning" : "secondary";

  if (!isEditing) {
    return (
      <tr className="hover:bg-muted/20 transition-colors">
        <td className="px-4 py-3 font-medium">{categoryLabel}</td>
        <td className="px-4 py-3">{rule.freshness_policy.max_age_days} days</td>
        <td className="px-4 py-3">{rule.freshness_policy.grace_period_days} days</td>
        <td className="px-4 py-3">
          <Badge variant={actionVariant} className="text-[11px]">{FRESHNESS_ACTION_LABELS[rule.freshness_policy.action]}</Badge>
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-1">
            {rule.freshness_policy.notify_targets.map((t) => (
              <Badge key={t} variant="outline" className="text-[11px]">{t}</Badge>
            ))}
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <Button variant="ghost" size="icon" onClick={onStartEdit}><Edit className="h-3.5 w-3.5" /></Button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-blue-50/40">
      <td className="px-4 py-3 font-medium">{categoryLabel}</td>
      <td className="px-4 py-2">
        <Input type="number" className="h-8 w-20" value={draft.max_age_days}
          onChange={(e) => setDraft((d) => ({ ...d, max_age_days: Number(e.target.value) || 0 }))} />
      </td>
      <td className="px-4 py-2">
        <Input type="number" className="h-8 w-20" value={draft.grace_period_days}
          onChange={(e) => setDraft((d) => ({ ...d, grace_period_days: Number(e.target.value) || 0 }))} />
      </td>
      <td className="px-4 py-2">
        <select className="h-8 rounded-md border border-border bg-background px-2 text-sm" value={draft.action}
          onChange={(e) => setDraft((d) => ({ ...d, action: e.target.value as FreshnessAction }))}>
          {ACTIONS.map((a) => <option key={a} value={a}>{FRESHNESS_ACTION_LABELS[a]}</option>)}
        </select>
      </td>
      <td className="px-4 py-2">
        <div className="flex gap-2">
          {TARGETS.map((t) => (
            <label key={t} className="flex items-center gap-1 text-xs">
              <input type="checkbox" checked={draft.notify_targets.includes(t)}
                onChange={(e) => setDraft((d) => ({
                  ...d, notify_targets: e.target.checked ? [...d.notify_targets, t] : d.notify_targets.filter((nt) => nt !== t),
                }))} />
              {t}
            </label>
          ))}
        </div>
      </td>
      <td className="px-4 py-2 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setDraft(rule.freshness_policy); onCancelEdit(); }}>
            <X className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" onClick={() => onSave({ ...rule, freshness_policy: draft })}>
            <Save className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
