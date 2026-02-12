"use client";

import React from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { COMPETITOR_TYPE_LABELS } from "@/lib/constants";
import { useDomains, useMarkets } from "@/hooks/use-taxonomy";
import { Input } from "@/components/ui/input";

import type { CompetitorType } from "@/types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CompetitorFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTypes: CompetitorType[];
  onToggleType: (type: CompetitorType) => void;
  selectedDomains: string[];
  onToggleDomain: (domainId: string) => void;
  selectedMarkets: string[];
  onToggleMarket: (marketId: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CompetitorFilterBar({
  searchQuery,
  onSearchChange,
  selectedTypes,
  onToggleType,
  selectedDomains,
  onToggleDomain,
  selectedMarkets,
  onToggleMarket,
  hasActiveFilters,
  onClearFilters,
}: CompetitorFilterBarProps): React.JSX.Element {
  const { data: DOMAINS } = useDomains();
  const { data: MARKETS } = useMarkets();

  return (
    <>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search competitors by name or description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Type Filter */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Type
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                Object.entries(COMPETITOR_TYPE_LABELS) as [
                  CompetitorType,
                  string,
                ][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => onToggleType(key)}
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    selectedTypes.includes(key)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Domain Filter */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Domain
            </p>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map((domain) => (
                <button
                  key={domain.id}
                  onClick={() => onToggleDomain(domain.id)}
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    selectedDomains.includes(domain.id)
                      ? "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {domain.name}
                </button>
              ))}
            </div>
          </div>

          {/* Market Filter */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Market
            </p>
            <div className="flex flex-wrap gap-2">
              {MARKETS.map((market) => (
                <button
                  key={market.id}
                  onClick={() => onToggleMarket(market.id)}
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    selectedMarkets.includes(market.id)
                      ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {market.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <button
              onClick={onClearFilters}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </>
  );
}
