import React from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  OUTPUT_FORMAT_OPTIONS,
  MOCK_EXISTING_RESEARCH,
} from "./wizard-types";

import type { WizardStepProps } from "./wizard-types";

// =============================================================================
// Component
// =============================================================================

export function StepDefine({
  form,
  onUpdate,
}: WizardStepProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Define Your Research</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Research Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Research Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { value: "new", label: "New", desc: "Start fresh" },
                {
                  value: "refresh",
                  label: "Refresh",
                  desc: "Update existing research",
                },
                {
                  value: "clone",
                  label: "Clone",
                  desc: "Copy and adjust a dimension",
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  onUpdate({
                    researchType: opt.value,
                    referenceResearchId: "",
                    clonedChangedDimension: null,
                  })
                }
                className={cn(
                  "rounded-lg border-2 p-4 text-left transition-colors",
                  form.researchType === opt.value
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <span className="block text-sm font-semibold text-gray-900">
                  {opt.label}
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Reference Research (Refresh / Clone) */}
        {(form.researchType === "refresh" ||
          form.researchType === "clone") && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Reference Research
            </label>
            <select
              value={form.referenceResearchId}
              onChange={(e) =>
                onUpdate({ referenceResearchId: e.target.value })
              }
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select existing research...</option>
              {MOCK_EXISTING_RESEARCH.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Clone Changed Dimension */}
        {form.researchType === "clone" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Which dimension is changing?
            </label>
            <div className="flex gap-3">
              {(
                [
                  { value: "market", label: "Market" },
                  { value: "domain", label: "Domain" },
                  { value: "sector", label: "Sector" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    onUpdate({ clonedChangedDimension: opt.value })
                  }
                  className={cn(
                    "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                    form.clonedChangedDimension === opt.value
                      ? "border-blue-600 bg-blue-50 text-blue-800"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Title</label>
          <Input
            placeholder="e.g. Netherlands Security Market Analysis Q1 2026"
            value={form.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Description
          </label>
          <Textarea
            placeholder="Brief description of the research scope and goals..."
            value={form.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            rows={3}
          />
        </div>

        {/* Core Question */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Core Question
          </label>
          <p className="text-xs text-gray-500">
            What must this research answer?
          </p>
          <Textarea
            placeholder="e.g. What is the current state and growth trajectory of the managed security services market in the Netherlands, and where are the underserved segments?"
            value={form.coreQuestion}
            onChange={(e) => onUpdate({ coreQuestion: e.target.value })}
            rows={3}
          />
        </div>

        {/* Output Format */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Output Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            {OUTPUT_FORMAT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onUpdate({ outputFormat: opt.value })}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors",
                    form.outputFormat === opt.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 mt-0.5 shrink-0",
                      form.outputFormat === opt.value
                        ? "text-blue-600"
                        : "text-gray-400"
                    )}
                  />
                  <div>
                    <span className="block text-sm font-semibold text-gray-900">
                      {opt.label}
                    </span>
                    <span className="block text-xs text-gray-500 mt-0.5">
                      {opt.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Context Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Context</label>
          <p className="text-xs text-gray-500">
            Why is this research needed?
          </p>
          <Textarea
            placeholder="e.g. ITQ is evaluating entry into the Dutch managed security market. We need to understand market size, competitive landscape, and regulatory drivers to build a business case."
            value={form.contextDescription}
            onChange={(e) =>
              onUpdate({ contextDescription: e.target.value })
            }
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
