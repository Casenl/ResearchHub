"use client";

import { Filter } from "lucide-react";

import { cn } from "@/lib/utils";

import type { Sector } from "@/types";

// =============================================================================
// Props
// =============================================================================

interface CoverageFilterBarProps {
  sectors: Sector[];
  selectedSectorId: string | null;
  onFilterChange: (sectorId: string | null) => void;
}

// =============================================================================
// CoverageFilterBar
// =============================================================================

export function CoverageFilterBar({
  sectors,
  selectedSectorId,
  onFilterChange,
}: CoverageFilterBarProps) {
  function handleSectorClick(sectorId: string) {
    if (selectedSectorId === sectorId) {
      onFilterChange(null);
    } else {
      onFilterChange(sectorId);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Sector</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {sectors.map((sector) => {
          const isSelected = selectedSectorId === sector.id;
          return (
            <button
              key={sector.id}
              onClick={() => handleSectorClick(sector.id)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {sector.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
