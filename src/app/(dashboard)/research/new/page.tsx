"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

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
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<WizardFormState>(initialFormState);

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
    if (currentStep < TOTAL_STEPS) setCurrentStep((s) => s + 1);
  };

  const goBack = (): void => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  // ---------------------------------------------------------------------------
  // Generation logic
  // ---------------------------------------------------------------------------

  const handleGenerate = useCallback(() => {
    updateForm({ isGenerating: true });
    setTimeout(() => {
      updateForm({ isGenerating: false, isGenerated: true });
    }, 1200);
  }, [updateForm]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-3xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          New Research Project
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Set up a new market intelligence research project with structured
          prompts and notebook generation.
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      {/* Step Content */}
      <div className="mb-8">
        {currentStep === 1 && (
          <StepDefine form={form} onUpdate={updateForm} />
        )}
        {currentStep === 2 && (
          <StepDimensions
            form={form}
            onUpdate={updateForm}
            onToggleArrayItem={toggleArrayItem}
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
            <Button variant="ghost" asChild className="gap-2 text-gray-500">
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
            <Button variant="ghost" asChild className="gap-2 text-gray-500">
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
