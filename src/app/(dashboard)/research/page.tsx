"use client";

import Link from "next/link";
import { FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useResearchList } from "@/hooks/use-research";

import { useResearchFilters } from "./_components/use-research-filters";
import { ResearchSearchBar } from "./_components/research-search-bar";
import { ResearchFilterPanel } from "./_components/research-filter-panel";
import { ResearchCard } from "./_components/research-card";
import { ResearchEmptyState } from "./_components/research-empty-state";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ResearchLibraryPage(): React.JSX.Element {
  const { data: research, isLoading } = useResearchList();
  const {
    searchQuery,
    selectedStatuses,
    selectedDomains,
    selectedMarkets,
    selectedSectors,
    selectedFormats,
    dateFilter,
    isFilterPanelOpen,
    hasActiveFilters,
    filteredResearch,
    totalCount,
    setSearchQuery,
    toggleStatus,
    toggleDomain,
    toggleMarket,
    toggleSector,
    toggleFormat,
    setDateFilter,
    setIsFilterPanelOpen,
    clearAllFilters,
  } = useResearchFilters(research);

  if (isLoading && research.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Research Library
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredResearch.length} of {totalCount} research items
          </p>
        </div>
        <Button asChild>
          <Link href="/research/new">
            <FileText className="mr-1 h-4 w-4" />
            New Research
          </Link>
        </Button>
      </div>

      {/* Search and filter bar */}
      <ResearchSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isFilterPanelOpen={isFilterPanelOpen}
        onToggleFilters={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
        hasActiveFilters={hasActiveFilters}
        onClearAll={clearAllFilters}
      />

      {/* Filter panel */}
      {isFilterPanelOpen && (
        <ResearchFilterPanel
          selectedStatuses={selectedStatuses}
          selectedDomains={selectedDomains}
          selectedMarkets={selectedMarkets}
          selectedSectors={selectedSectors}
          selectedFormats={selectedFormats}
          dateFilter={dateFilter}
          onToggleStatus={toggleStatus}
          onToggleDomain={toggleDomain}
          onToggleMarket={toggleMarket}
          onToggleSector={toggleSector}
          onToggleFormat={toggleFormat}
          onDateFilterChange={setDateFilter}
        />
      )}

      {/* Research cards */}
      {filteredResearch.length === 0 ? (
        <ResearchEmptyState />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredResearch.map((research) => (
            <ResearchCard key={research.id} research={research} />
          ))}
        </div>
      )}
    </div>
  );
}
