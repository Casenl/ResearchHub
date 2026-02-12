"use client";

import React from "react";

import { ChevronDown, ChevronRight, Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CONTEXT_CATEGORY_LABELS } from "@/lib/constants";

import { RuleDetail } from "./rule-detail";

import type { ContextRule } from "@/types";

// =============================================================================
// Props
// =============================================================================

interface ClassificationSectionProps {
  rules: ContextRule[];
  expandedId: string | null;
  editingId: string | null;
  onToggleExpand: (id: string) => void;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onSaveRule: (rule: ContextRule) => void;
}

// =============================================================================
// Classification Section
// =============================================================================

export function ClassificationSection({
  rules,
  expandedId,
  editingId,
  onToggleExpand,
  onStartEdit,
  onCancelEdit,
  onSaveRule,
}: ClassificationSectionProps): React.JSX.Element {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Classification Rules
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Required metadata, allowed file types, and size limits per document
          category
        </p>
      </div>

      <div className="space-y-2">
        {rules.map((rule) => {
          const isExpanded = expandedId === rule.id;
          const isEditing = editingId === rule.id;
          const categoryLabel =
            CONTEXT_CATEGORY_LABELS[
              rule.category as keyof typeof CONTEXT_CATEGORY_LABELS
            ] ?? rule.category;

          return (
            <Card key={rule.id} className="overflow-hidden">
              {/* Collapsed row */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => onToggleExpand(rule.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggleExpand(rule.id);
                  }
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-muted/40",
                  isExpanded && "border-b border-border bg-muted/20",
                )}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">{categoryLabel}</span>
                  <Badge variant="secondary" className="text-[11px]">
                    {rule.required_fields.length} required fields
                  </Badge>
                  <Badge variant="outline" className="text-[11px]">
                    {rule.allowed_file_types.length} file types
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    max {rule.max_file_size_mb} MB
                  </span>
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartEdit(rule.id);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <RuleDetail
                  rule={rule}
                  isEditing={isEditing}
                  onStartEdit={() => onStartEdit(rule.id)}
                  onCancelEdit={onCancelEdit}
                  onSave={onSaveRule}
                />
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
