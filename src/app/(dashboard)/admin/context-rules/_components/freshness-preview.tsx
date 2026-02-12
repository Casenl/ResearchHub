"use client";

import React, { useMemo } from "react";

import { Clock, FileCheck, AlertTriangle } from "lucide-react";
import { differenceInDays } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CONTEXT_CATEGORY_LABELS } from "@/lib/constants";
import { useContextDocuments } from "@/hooks/use-context-documents";

import type { ContextRule } from "@/types";

// =============================================================================
// Props
// =============================================================================

interface FreshnessPreviewProps {
  rules: ContextRule[];
}

// =============================================================================
// Freshness Preview Panel
// =============================================================================

export function FreshnessPreview({
  rules,
}: FreshnessPreviewProps): React.JSX.Element {
  const { data: contextDocuments } = useContextDocuments();

  const preview = useMemo(() => {
    const now = new Date();
    let staleCount = 0;
    let graceCount = 0;
    let freshCount = 0;
    const staleByCategory: Record<string, number> = {};

    for (const doc of contextDocuments) {
      const rule = rules.find((r) => r.category === doc.category);
      if (!rule) {
        freshCount++;
        continue;
      }

      const ageDays = differenceInDays(now, new Date(doc.updated_at));
      const maxAge = rule.freshness_policy.max_age_days;
      const grace = rule.freshness_policy.grace_period_days;

      if (ageDays > maxAge + grace) {
        staleCount++;
        staleByCategory[doc.category] = (staleByCategory[doc.category] ?? 0) + 1;
      } else if (ageDays > maxAge) {
        graceCount++;
      } else {
        freshCount++;
      }
    }

    return { staleCount, graceCount, freshCount, staleByCategory };
  }, [rules, contextDocuments]);

  const stats = [
    {
      label: "Fresh",
      count: preview.freshCount,
      icon: FileCheck,
      color: "text-green-600 bg-green-50 border-green-200",
    },
    {
      label: "Grace Period",
      count: preview.graceCount,
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      label: "Stale",
      count: preview.staleCount,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50 border-red-200",
    },
  ];

  const staleCategories = Object.entries(preview.staleByCategory);

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Stale Documents Preview
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Impact of current policies on {contextDocuments.length} library
          documents
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, count, icon: Icon, color }) => (
          <Card key={label} className={`border ${color}`}>
            <CardContent className="flex items-center gap-3 p-4">
              <Icon className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs font-medium">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {staleCategories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {staleCategories.map(([cat, count]) => {
            const catLabel =
              CONTEXT_CATEGORY_LABELS[
                cat as keyof typeof CONTEXT_CATEGORY_LABELS
              ] ?? cat;
            return (
              <Badge key={cat} variant="destructive" className="text-[11px]">
                {catLabel}: {count}
              </Badge>
            );
          })}
        </div>
      )}
    </section>
  );
}
