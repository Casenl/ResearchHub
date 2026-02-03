"use client";

import { useState } from "react";

import { DOMAINS } from "@/data/domains";
import { SECTORS } from "@/data/sectors";

import { CoverageFilterBar } from "./_components/coverage-filter-bar";
import { CoverageGrid } from "./_components/coverage-grid";
import { CoverageStats } from "./_components/coverage-stats";
import { useCoverageData } from "./_components/use-coverage-data";

// =============================================================================
// CoveragePage
// =============================================================================

export default function CoveragePage() {
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const { marketGroups, cellData, allStatuses } =
    useCoverageData(selectedSectorId);

  function handleFilterChange(sectorId: string | null) {
    setSelectedSectorId(sectorId);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Coverage Matrix</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Research coverage heatmap across markets and domains
        </p>
      </div>

      {/* Stats Cards */}
      <CoverageStats cellStatuses={allStatuses} />

      {/* Filter Bar */}
      <CoverageFilterBar
        sectors={SECTORS}
        selectedSectorId={selectedSectorId}
        onFilterChange={handleFilterChange}
      />

      {/* Heatmap Grid */}
      <CoverageGrid
        marketGroups={marketGroups}
        domains={DOMAINS}
        cellData={cellData}
      />

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-green-500" />
          <span>Fresh (within 6 months)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-amber-500" />
          <span>Stale (older than 6 months)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-blue-500" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-red-500/30" />
          <span>No Coverage</span>
        </div>
      </div>
    </div>
  );
}
