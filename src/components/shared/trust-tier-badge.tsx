import { cn } from "@/lib/utils";
import { getClassificationForTier } from "@/lib/trust-tiers";

import type { QualityTier, ValidationStatus } from "@/types";

const CLASSIFICATION_STYLES: Record<string, string> = {
  authoritative: "bg-emerald-100 text-emerald-800 border-emerald-200",
  established: "bg-blue-100 text-blue-800 border-blue-200",
  standard: "bg-amber-100 text-amber-800 border-amber-200",
  unverified: "bg-red-100 text-red-800 border-red-200",
};

const VALIDATION_DOT_STYLES: Record<string, string> = {
  corroborated: "bg-green-500",
  human_verified: "bg-blue-500",
  disputed: "bg-red-500",
};

interface TrustTierBadgeProps {
  tier: QualityTier;
  validationStatus?: ValidationStatus;
  className?: string;
}

export function TrustTierBadge({
  tier,
  validationStatus,
  className,
}: TrustTierBadgeProps) {
  const classification = getClassificationForTier(tier);
  const tierClass = CLASSIFICATION_STYLES[classification];
  const dotClass =
    validationStatus ? VALIDATION_DOT_STYLES[validationStatus] : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold",
        tierClass,
        className
      )}
    >
      T{tier}
      {validationStatus && validationStatus !== "unverified" && dotClass && (
        <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />
      )}
    </span>
  );
}
