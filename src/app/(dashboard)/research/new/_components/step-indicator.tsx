import React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

// =============================================================================
// Props
// =============================================================================

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

// =============================================================================
// Constants
// =============================================================================

const STEP_LABELS = [
  "Define Research",
  "Select Dimensions",
  "Context & Schedule",
  "Review & Generate",
];

// =============================================================================
// Component
// =============================================================================

export function StepIndicator({
  currentStep,
  totalSteps,
}: StepIndicatorProps): React.JSX.Element {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isUpcoming = step > currentStep;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isCompleted &&
                      "border-green-600 bg-green-600 text-white",
                    isCurrent &&
                      "border-blue-600 bg-blue-600 text-white",
                    isUpcoming &&
                      "border-border bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium",
                    isCompleted && "text-green-700 dark:text-green-300",
                    isCurrent && "text-blue-700 dark:text-blue-300",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {STEP_LABELS[i]}
                </span>
              </div>
              {step < totalSteps && (
                <div
                  className={cn(
                    "mt-[-1.25rem] h-0.5 flex-1 mx-3 transition-colors",
                    step < currentStep ? "bg-green-600" : "bg-border"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
}
