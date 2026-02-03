"use client";

import React from "react";
import { Check, FileText, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMarkets, useDomains, useSectors } from "@/hooks/use-taxonomy";
import {
  generatePrompts,
  getNotebookTypesForFormat,
  NOTEBOOK_TYPE_DISPLAY_LABELS,
} from "@/lib/prompt-templates";

import { CopyablePrompt } from "./copyable-prompt";
import {
  MOCK_CONTEXT_DOCUMENTS,
  MOCK_EXISTING_RESEARCH,
  OUTPUT_FORMAT_LABELS,
  REFRESH_SCHEDULE_LABELS,
  RESEARCH_TYPE_LABELS,
} from "./wizard-types";

import type { WizardStepProps, WizardFormState, SectorData } from "./wizard-types";
import type { Market, Domain, Sector, NotebookType } from "@/types";

// =============================================================================
// Props
// =============================================================================

interface StepReviewProps extends WizardStepProps {
  onGenerate: () => void;
}

// =============================================================================
// Helpers
// =============================================================================

function getGeneratedNotebooks(
  form: WizardFormState,
  allDomains: Domain[],
  allMarkets: Market[],
  allSectors: Sector[]
): {
  type: NotebookType;
  label: string;
  discovery_prompt: string;
  analysis_prompts: string[];
}[] {
  const notebookTypes = getNotebookTypesForFormat(form.outputFormat);
  const domains = allDomains.filter((d) =>
    form.selectedDomainIds.includes(d.id)
  );
  const markets = allMarkets.filter((m) =>
    form.selectedMarketIds.includes(m.id)
  );
  const sectors = form.allSectors
    ? allSectors
    : allSectors.filter((s) => form.selectedSectorIds.includes(s.id));

  const primaryDomain = domains[0]?.name ?? "Security";
  const primaryGeography = markets[0]?.name ?? "EU";
  const primarySector = sectors[0]?.name ?? "General";
  const sectorRegulations =
    (sectors[0] as unknown as SectorData)?.relevant_regulations ?? [];

  return notebookTypes.map((type) => {
    const prompts = generatePrompts({
      domain: primaryDomain,
      notebookType: type,
      geography: primaryGeography,
      sector: primarySector,
      sectorRegulations,
    });

    return {
      type,
      label: NOTEBOOK_TYPE_DISPLAY_LABELS[type],
      ...prompts,
    };
  });
}

// =============================================================================
// Component
// =============================================================================

export function StepReview({
  form,
  onGenerate,
}: StepReviewProps): React.JSX.Element {
  const { data: allMarkets } = useMarkets();
  const { data: allDomains } = useDomains();
  const { data: allSectors } = useSectors();

  const selectedMarkets = allMarkets.filter((m) =>
    form.selectedMarketIds.includes(m.id)
  );
  const selectedDomains = allDomains.filter((d) =>
    form.selectedDomainIds.includes(d.id)
  );
  const selectedSectors = form.allSectors
    ? allSectors
    : allSectors.filter((s) => form.selectedSectorIds.includes(s.id));
  const selectedDocs = MOCK_CONTEXT_DOCUMENTS.filter((d) =>
    form.selectedContextDocIds.includes(d.id)
  );
  const generatedNotebooks = getGeneratedNotebooks(form, allDomains, allMarkets, allSectors);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Research Brief Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Header */}
            <div className="rounded-lg bg-gray-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">
                  {form.title || "Untitled Research"}
                </h3>
                <Badge variant="default" className="px-2.5 py-0.5 text-sm">
                  {RESEARCH_TYPE_LABELS[form.researchType]}
                </Badge>
              </div>
              {form.description && (
                <p className="text-sm text-gray-600">{form.description}</p>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">
                  Output Format
                </span>
                <p className="text-gray-900 mt-0.5">
                  {OUTPUT_FORMAT_LABELS[form.outputFormat]}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-500">
                  Refresh Schedule
                </span>
                <p className="text-gray-900 mt-0.5">
                  {REFRESH_SCHEDULE_LABELS[form.refreshSchedule]}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Requester</span>
                <p className="text-gray-900 mt-0.5">
                  {form.requesterName}
                  {form.requesterRole && (
                    <span className="text-gray-500">
                      {" "}
                      &middot; {form.requesterRole}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Deadline</span>
                <p className="text-gray-900 mt-0.5">
                  {form.deadline || "Not set"}
                </p>
              </div>
            </div>

            {/* Core Question */}
            {form.coreQuestion && (
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Core Question
                </span>
                <p className="text-sm text-gray-900 mt-1 bg-amber-50 border border-amber-200 rounded-md p-3">
                  {form.coreQuestion}
                </p>
              </div>
            )}

            {/* Context Description */}
            {form.contextDescription && (
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Context
                </span>
                <p className="text-sm text-gray-700 mt-1">
                  {form.contextDescription}
                </p>
              </div>
            )}

            {/* Dimensions */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-gray-500">
                Dimensions
              </span>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Markets
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedMarkets.length > 0 ? (
                      selectedMarkets.map((m) => (
                        <Badge
                          key={m.id}
                          variant="default"
                          className="px-2 py-0.5 text-xs"
                        >
                          {m.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">
                        None selected
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Domains
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedDomains.length > 0 ? (
                      selectedDomains.map((d) => (
                        <Badge
                          key={d.id}
                          variant="info"
                          className="px-2 py-0.5 text-xs"
                        >
                          {d.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">
                        None selected
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Sectors
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {form.allSectors ? (
                      <Badge
                        variant="warning"
                        className="px-2 py-0.5 text-xs"
                      >
                        All Sectors
                      </Badge>
                    ) : selectedSectors.length > 0 ? (
                      selectedSectors.map((s) => (
                        <Badge
                          key={s.id}
                          variant="warning"
                          className="px-2 py-0.5 text-xs"
                        >
                          {s.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">
                        None selected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Context Documents */}
            {selectedDocs.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Context Documents
                </span>
                <ul className="mt-1.5 space-y-1">
                  {selectedDocs.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <FileText className="h-3.5 w-3.5 text-gray-400" />
                      {doc.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reference Research (Refresh/Clone) */}
            {form.referenceResearchId && (
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Reference Research
                </span>
                <p className="text-sm text-gray-700 mt-0.5">
                  {MOCK_EXISTING_RESEARCH.find(
                    (r) => r.id === form.referenceResearchId
                  )?.title ?? form.referenceResearchId}
                </p>
                {form.clonedChangedDimension && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Changed dimension:{" "}
                    <span className="font-medium capitalize">
                      {form.clonedChangedDimension}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      {!form.isGenerated && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={onGenerate}
            disabled={form.isGenerating}
            className="gap-2"
          >
            {form.isGenerating ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Notebook Structure & Prompts
              </>
            )}
          </Button>
        </div>
      )}

      {/* Generated Notebooks */}
      {form.isGenerated && (
        <GeneratedNotebooksList
          notebooks={generatedNotebooks}
          outputFormat={form.outputFormat}
        />
      )}
    </div>
  );
}

// =============================================================================
// Generated Notebooks Sub-component
// =============================================================================

function GeneratedNotebooksList({
  notebooks,
  outputFormat,
}: {
  notebooks: ReturnType<typeof getGeneratedNotebooks>;
  outputFormat: WizardFormState["outputFormat"];
}): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-green-700">
        <Check className="h-5 w-5" />
        <span className="text-sm font-semibold">
          Notebook structure generated successfully
        </span>
      </div>

      <p className="text-sm text-gray-600">
        Based on the{" "}
        <strong>{OUTPUT_FORMAT_LABELS[outputFormat]}</strong>{" "}
        format, the following notebooks are needed:
      </p>

      {notebooks.map((notebook) => (
        <Card key={notebook.type}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Badge variant="info" className="px-2.5 py-0.5 text-sm">
                {notebook.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <CopyablePrompt
              label="Discovery Prompt"
              value={notebook.discovery_prompt}
            />
            {notebook.analysis_prompts.map((prompt, idx) => (
              <CopyablePrompt
                key={idx}
                label={"Analysis Prompt " + (idx + 1)}
                value={prompt}
              />
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Create Button */}
      <div className="flex justify-center pt-2">
        <Button size="lg" className="gap-2">
          <Check className="h-5 w-5" />
          Create Research Project
        </Button>
      </div>
    </div>
  );
}
