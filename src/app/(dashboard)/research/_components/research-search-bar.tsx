"use client";

import { Search, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ResearchSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isFilterPanelOpen: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ResearchSearchBar({
  searchQuery,
  onSearchChange,
  isFilterPanelOpen,
  onToggleFilters,
  hasActiveFilters,
  onClearAll,
}: ResearchSearchBarProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by title or description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <Button
        variant={isFilterPanelOpen ? "secondary" : "outline"}
        size="sm"
        onClick={onToggleFilters}
      >
        <Filter className="mr-1 h-4 w-4" />
        Filters
        {hasActiveFilters && (
          <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            !
          </span>
        )}
      </Button>
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearAll}>
          Clear all
        </Button>
      )}
    </div>
  );
}
