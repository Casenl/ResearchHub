import React from "react";
import { Check, Calendar } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  MOCK_CONTEXT_DOCUMENTS,
  CONTEXT_CATEGORY_LABELS,
} from "./wizard-types";

import type { WizardStepProps } from "./wizard-types";

// =============================================================================
// Component
// =============================================================================

export function StepContext({
  form,
  onUpdate,
  onToggleArrayItem,
}: WizardStepProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Context & Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Context Library Documents */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Context Library Documents
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Select documents to provide context for this research.
          </p>
          <div className="space-y-2 rounded-md border border-gray-200 dark:border-gray-700 p-3">
            {MOCK_CONTEXT_DOCUMENTS.map((doc) => {
              const isSelected = form.selectedContextDocIds.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() =>
                    onToggleArrayItem?.("selectedContextDocIds", doc.id)
                  }
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
                    isSelected ? "bg-blue-50 dark:bg-blue-950" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                      isSelected
                        ? "border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500"
                        : "border-gray-300 dark:border-gray-600"
                    )}
                  >
                    {isSelected && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                      {doc.title}
                    </span>
                  </div>
                  <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                    {CONTEXT_CATEGORY_LABELS[doc.category]}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Refresh Schedule */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Refresh Schedule
          </label>
          <div className="flex gap-3">
            {(
              [
                { value: "quarterly", label: "Quarterly" },
                { value: "semi_annually", label: "Semi-annually" },
                { value: "ad_hoc", label: "Ad-hoc" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdate({ refreshSchedule: opt.value })}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors",
                  form.refreshSchedule === opt.value
                    ? "border-blue-600 bg-blue-50 text-blue-800 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-200"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600"
                )}
              >
                <Calendar
                  className={cn(
                    "h-4 w-4",
                    form.refreshSchedule === opt.value
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-500"
                  )}
                />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Deadline */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</label>
          <Input
            type="date"
            value={form.deadline}
            onChange={(e) => onUpdate({ deadline: e.target.value })}
          />
        </div>

        {/* Requester */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Requester Name
            </label>
            <Input
              value={form.requesterName}
              onChange={(e) => onUpdate({ requesterName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <Input
              value={form.requesterRole}
              onChange={(e) => onUpdate({ requesterRole: e.target.value })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
