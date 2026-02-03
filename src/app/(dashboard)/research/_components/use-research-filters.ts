import { useState, useMemo } from "react";

import { MOCK_RESEARCH } from "@/data/mock-research";

import type { ResearchStatus, OutputFormat, Research } from "@/types";

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface ResearchFiltersState {
  searchQuery: string;
  selectedStatuses: ResearchStatus[];
  selectedDomains: string[];
  selectedMarkets: string[];
  selectedSectors: string[];
  selectedFormats: OutputFormat[];
  dateFilter: "all" | "recent";
  isFilterPanelOpen: boolean;
  hasActiveFilters: boolean;
  filteredResearch: Research[];
  totalCount: number;
}

export interface ResearchFiltersActions {
  setSearchQuery: (query: string) => void;
  toggleStatus: (status: ResearchStatus) => void;
  toggleDomain: (domainId: string) => void;
  toggleMarket: (marketId: string) => void;
  toggleSector: (sectorId: string) => void;
  toggleFormat: (format: OutputFormat) => void;
  setDateFilter: (value: "all" | "recent") => void;
  setIsFilterPanelOpen: (isOpen: boolean) => void;
  clearAllFilters: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useResearchFilters(): ResearchFiltersState &
  ResearchFiltersActions {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ResearchStatus[]>(
    [],
  );
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<OutputFormat[]>([]);
  const [dateFilter, setDateFilter] = useState<"all" | "recent">("all");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // -- Toggle helpers -------------------------------------------------------

  const toggleStatus = (status: ResearchStatus): void => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const toggleDomain = (domainId: string): void => {
    setSelectedDomains((prev) =>
      prev.includes(domainId)
        ? prev.filter((d) => d !== domainId)
        : [...prev, domainId],
    );
  };

  const toggleMarket = (marketId: string): void => {
    setSelectedMarkets((prev) =>
      prev.includes(marketId)
        ? prev.filter((m) => m !== marketId)
        : [...prev, marketId],
    );
  };

  const toggleSector = (sectorId: string): void => {
    setSelectedSectors((prev) =>
      prev.includes(sectorId)
        ? prev.filter((s) => s !== sectorId)
        : [...prev, sectorId],
    );
  };

  const toggleFormat = (format: OutputFormat): void => {
    setSelectedFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format],
    );
  };

  const clearAllFilters = (): void => {
    setSelectedStatuses([]);
    setSelectedDomains([]);
    setSelectedMarkets([]);
    setSelectedSectors([]);
    setSelectedFormats([]);
    setDateFilter("all");
    setSearchQuery("");
  };

  // -- Derived state --------------------------------------------------------

  const hasActiveFilters =
    selectedStatuses.length > 0 ||
    selectedDomains.length > 0 ||
    selectedMarkets.length > 0 ||
    selectedSectors.length > 0 ||
    selectedFormats.length > 0 ||
    dateFilter !== "all" ||
    searchQuery.length > 0;

  const filteredResearch = useMemo(() => {
    let results = [...MOCK_RESEARCH];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q),
      );
    }

    if (selectedStatuses.length > 0) {
      results = results.filter((r) => selectedStatuses.includes(r.status));
    }

    if (selectedDomains.length > 0) {
      results = results.filter((r) =>
        r.dimensions.domains.some((d) => selectedDomains.includes(d.id)),
      );
    }

    if (selectedMarkets.length > 0) {
      results = results.filter((r) =>
        r.dimensions.markets.some((m) => selectedMarkets.includes(m.id)),
      );
    }

    if (selectedSectors.length > 0) {
      results = results.filter((r) =>
        r.dimensions.sectors.some((s) => selectedSectors.includes(s.id)),
      );
    }

    if (selectedFormats.length > 0) {
      results = results.filter((r) =>
        selectedFormats.includes(r.output_format),
      );
    }

    if (dateFilter === "recent") {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      results = results.filter(
        (r) => new Date(r.updated_at) >= sixMonthsAgo,
      );
    }

    results.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );

    return results;
  }, [
    searchQuery,
    selectedStatuses,
    selectedDomains,
    selectedMarkets,
    selectedSectors,
    selectedFormats,
    dateFilter,
  ]);

  return {
    // State
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
    totalCount: MOCK_RESEARCH.length,
    // Actions
    setSearchQuery,
    toggleStatus,
    toggleDomain,
    toggleMarket,
    toggleSector,
    toggleFormat,
    setDateFilter,
    setIsFilterPanelOpen,
    clearAllFilters,
  };
}
