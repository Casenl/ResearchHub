"use client";

import React, { useState } from "react";

import { DEFAULT_CONTEXT_RULES } from "@/data/context-rules";

import { ClassificationSection } from "./_components/classification-section";
import { FreshnessSection } from "./_components/freshness-section";
import { FreshnessPreview } from "./_components/freshness-preview";
import { useToast } from "./_components/use-toast";

import type { ContextRule } from "@/types";

// =============================================================================
// Context Rules Page — orchestrator
// =============================================================================

export default function ContextRulesPage(): React.JSX.Element {
  const [rules, setRules] = useState<ContextRule[]>([...DEFAULT_CONTEXT_RULES]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { show, ToastNode } = useToast();

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    if (editingId && editingId !== id) {
      setEditingId(null);
    }
  };

  const handleStartEdit = (id: string) => {
    setEditingId(id);
    setExpandedId(id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveRule = (updated: ContextRule) => {
    setRules((prev) =>
      prev.map((r) => (r.id === updated.id ? { ...updated, updated_at: new Date().toISOString() } : r)),
    );
    setEditingId(null);
    show("Rule saved successfully");
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Context Library Rules
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure classification requirements and freshness policies per
            document category
          </p>
        </div>
      </div>

      {/* Classification Rules */}
      <ClassificationSection
        rules={rules}
        expandedId={expandedId}
        editingId={editingId}
        onToggleExpand={handleToggleExpand}
        onStartEdit={handleStartEdit}
        onCancelEdit={handleCancelEdit}
        onSaveRule={handleSaveRule}
      />

      {/* Freshness Policies */}
      <FreshnessSection
        rules={rules}
        editingId={editingId}
        onStartEdit={handleStartEdit}
        onCancelEdit={handleCancelEdit}
        onSaveRule={handleSaveRule}
      />

      {/* Stale Documents Preview */}
      <FreshnessPreview rules={rules} />

      {ToastNode}
    </div>
  );
}
