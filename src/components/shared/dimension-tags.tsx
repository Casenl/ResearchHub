import * as React from "react";

import { cn } from "@/lib/utils";

import type { ResearchDimensions } from "@/types";

interface DimensionTagsProps {
  dimensions: ResearchDimensions;
  className?: string;
  compact?: boolean;
}

export function DimensionTags({
  dimensions,
  className,
  compact = false,
}: DimensionTagsProps): React.JSX.Element {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {dimensions.markets.map((market) => (
        <span
          key={`market-${market.id}`}
          className={cn(
            "inline-flex items-center rounded-md border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200",
            compact
              ? "px-1.5 py-0.5 text-[10px] font-medium"
              : "px-2 py-0.5 text-xs font-medium"
          )}
        >
          {market.name}
        </span>
      ))}
      {dimensions.domains.map((domain) => (
        <span
          key={`domain-${domain.id}`}
          className={cn(
            "inline-flex items-center rounded-md border border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200",
            compact
              ? "px-1.5 py-0.5 text-[10px] font-medium"
              : "px-2 py-0.5 text-xs font-medium"
          )}
        >
          {domain.name}
        </span>
      ))}
      {dimensions.sectors.map((sector) => (
        <span
          key={`sector-${sector.id}`}
          className={cn(
            "inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
            compact
              ? "px-1.5 py-0.5 text-[10px] font-medium"
              : "px-2 py-0.5 text-xs font-medium"
          )}
        >
          {sector.name}
        </span>
      ))}
    </div>
  );
}
