"use client";

import { cn, formatDate } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

export type CoverageCellStatus = "fresh" | "stale" | "in_progress" | "empty";

interface CoverageCellProps {
  status: CoverageCellStatus;
  researchCount: number;
  newestPublishedAt: string | null;
}

// =============================================================================
// Status configuration
// =============================================================================

const STATUS_CONFIG: Record<CoverageCellStatus, { bg: string; label: string }> =
  {
    fresh: { bg: "bg-green-500", label: "Fresh" },
    stale: { bg: "bg-amber-500", label: "Stale" },
    in_progress: { bg: "bg-blue-500", label: "In Progress" },
    empty: { bg: "bg-red-500/70", label: "No Coverage" },
  };

// =============================================================================
// CoverageCell
// =============================================================================

export function CoverageCell({
  status,
  researchCount,
  newestPublishedAt,
}: CoverageCellProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="group relative">
      <div
        className={cn(
          "h-10 w-full rounded-md transition-all duration-150",
          "group-hover:ring-2 group-hover:ring-foreground/20 group-hover:scale-105",
          config.bg,
          status === "empty" && "opacity-30"
        )}
      />

      {/* Tooltip */}
      <div
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 z-50 mb-2",
          "-translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100"
        )}
      >
        <div className="whitespace-nowrap rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-lg">
          <p className="font-semibold">{config.label}</p>
          <p className="text-muted-foreground">
            {researchCount} research item{researchCount !== 1 ? "s" : ""}
          </p>
          {newestPublishedAt && (
            <p className="text-muted-foreground">
              Latest: {formatDate(newestPublishedAt)}
            </p>
          )}
        </div>
        {/* Tooltip arrow */}
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-border" />
      </div>
    </div>
  );
}
