"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCreateResearch } from "@/hooks/use-research";
import { useAuth } from "@/hooks/use-auth";
import { useGlobalToast } from "@/hooks/use-global-toast";
import { useMarkets, useDomains, useSectors } from "@/hooks/use-taxonomy";

import { StepIndicator } from "./_components/step-indicator";
import { StepDefine } from "./_components/step-define";
import { StepDimensions } from "./_components/step-dimensions";
import { StepContext } from "./_components/step-context";
import { StepReview } from "./_components/step-review";

import type { WizardFormState, ArrayToggleField } from "./_components/wizard-types";

// =============================================================================
// Initial Form State
// =============================================================================

const initialFormState: WizardFormState = {
  researchType: "new",
  referenceResearchId: "",
  title: "",
  description: "",
  coreQuestion: "",
  outputFormat: "factsheet",
  contextDescription: "",
  clonedChangedDimension: null,
  selectedMarketIds: [],
  selectedDomainIds: [],
  selectedSectorIds: [],
  allSectors: false,
  selectedContextDocIds: [],
  refreshSchedule: "quarterly",
  deadline: "",
  requesterName: "Jan de Vries",
  requesterRole: "Domain Lead - Security",
  isGenerating: false,
  isGenerated: false,
};

const TOTAL_STEPS = 4;

// =============================================================================
// Page Component
// =============================================================================

export default function NewResearchPage(): React.JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const { createResearch } = useCreateResearch();
  const { showToast } = useGlobalToast();
  const { data: allMarkets } = useMarkets();
  const { data: allDomains } = useDomains();
  const { data: allSectors } = useSectors();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<WizardFormState>(initialFormState);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  // ---------------------------------------------------------------------------
  // Form helpers
  // ---------------------------------------------------------------------------

  const updateForm = useCallback(
    (updates: Partial<WizardFormState>) => {
      setForm((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const toggleArrayItem = useCallback(
    (field: ArrayToggleField, id: string) => {
      setForm((prev) => {
        const arr = prev[field];
        const next = arr.includes(id)
          ? arr.filter((v) => v !== id)
          : [...arr, id];
        return { ...prev, [field]: next };
      });
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const goNext = (): void => {
    if (currentStep === 1) {
      const errors: Record<string, string> = {};
      if (!form.title.trim()) errors.title = "Title is required.";
      if (Object.keys(errors).length > 0) {
        setStepErrors(errors);
        return;
      }
      setStepErrors({});
    }
    if (currentStep === 2) {
      const errors: Record<string, string> = {};
      if (form.selectedMarketIds.length === 0) errors.markets = "Select at least one market.";
      if (form.selectedDomainIds.length === 0) errors.domains = "Select at least one domain.";
      if (Object.keys(errors).length > 0) {
        setStepErrors(errors);
        return;
      }
      setStepErrors({});
    }
    if (currentStep < TOTAL_STEPS) setCurrentStep((s) => s + 1);
  };

  const goBack = (): void => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  // ---------------------------------------------------------------------------
  // Generation logic
  // ---------------------------------------------------------------------------

  const handleGenerate = useCallback(async () => {
    updateForm({ isGenerating: true });
    try {
      const newId = await createResearch({
        title: form.title,
        description: form.description || form.coreQuestion,
        type: form.researchType,
        previous_version_id: form.researchType === "refresh" ? form.referenceResearchId || null : null,
        cloned_from_id: form.researchType === "clone" ? form.referenceResearchId || null : null,
        cloned_changed_dimension: form.clonedChangedDimension,
        status: "draft",
        output_format: form.outputFormat,
        published_at: null,
        expires_at: null,
        refresh_schedule: form.refreshSchedule,
        next_refresh_date: null,
        author_id: user?.uid ?? "",
        reviewer_id: null,
        dimensions: {
          markets: allMarkets.filter((m) => form.selectedMarketIds.includes(m.id)),
          domains: allDomains.filter((d) => form.selectedDomainIds.includes(d.id)),
          sectors: allSectors.filter((s) => form.selectedSectorIds.includes(s.id)),
        },
        tags: [],
        context_documents: [],
        notebooks: [],
        synthesis: "",
        change_log: "",
        assumptions: [],
        related_research_ids: [],
        version_ids: [],
        origin: "human",
        agent_identity: null,
        input_context: [],
        review_status: "none",
      });
      updateForm({ isGenerating: false, isGenerated: true });
      router.push(`/research/${newId}`);
    } catch (error) {
      console.error("Failed to create research:", error);
      updateForm({ isGenerating: false });
      showToast("Failed to create research project", "error");
    }
  }, [updateForm, createResearch, form, user, router, allMarkets, allDomains, allSectors, showToast]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-3xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          New Research Project
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up a new market intelligence research project with structured
          prompts and notebook generation.
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      {/* Step Content */}
      <div className="mb-8">
        {currentStep === 1 && (
          <StepDefine form={form} onUpdate={updateForm} errors={stepErrors} />
        )}
        {currentStep === 2 && (
          <StepDimensions
            form={form}
            onUpdate={updateForm}
            onToggleArrayItem={toggleArrayItem}
            errors={stepErrors}
          />
        )}
        {currentStep === 3 && (
          <StepContext
            form={form}
            onUpdate={updateForm}
            onToggleArrayItem={toggleArrayItem}
          />
        )}
        {currentStep === 4 && (
          <StepReview form={form} onUpdate={updateForm} onGenerate={handleGenerate} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 1 ? (
            <Button variant="outline" onClick={goBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button variant="ghost" asChild className="gap-2 text-muted-foreground">
              <Link href="/research">
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </Link>
            </Button>
          )}
        </div>
        <div>
          {currentStep < TOTAL_STEPS ? (
            <Button onClick={goNext} className="gap-2">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" asChild className="gap-2 text-muted-foreground">
              <Link href="/research">
                Cancel
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
