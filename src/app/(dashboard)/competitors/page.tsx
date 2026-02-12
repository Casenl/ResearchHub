"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Swords, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useCompetitors } from "@/hooks/use-competitors";

import { CompetitorFilterBar } from "./_components/competitor-filter-bar";
import { CompetitorCard } from "./_components/competitor-card";

import type { CompetitorType } from "@/types";

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function CompetitorsPage(): React.JSX.Element {
  const { data: competitors, isLoading } = useCompetitors();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<CompetitorType[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);

  const toggleType = (type: CompetitorType): void => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleDomain = (domainId: string): void => {
    setSelectedDomains((prev) =>
      prev.includes(domainId)
        ? prev.filter((d) => d !== domainId)
        : [...prev, domainId]
    );
  };

  const toggleMarket = (marketId: string): void => {
    setSelectedMarkets((prev) =>
      prev.includes(marketId)
        ? prev.filter((m) => m !== marketId)
        : [...prev, marketId]
    );
  };

  const filteredCompetitors = useMemo(() => {
    return competitors.filter((comp) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const hasMatch =
          comp.name.toLowerCase().includes(query) ||
          comp.description.toLowerCase().includes(query);
        if (!hasMatch) return false;
      }

      if (selectedTypes.length > 0 && !selectedTypes.includes(comp.type)) {
        return false;
      }

      if (selectedDomains.length > 0) {
        const hasDomain = comp.positions.some((p) =>
          selectedDomains.includes(p.domain_id)
        );
        if (!hasDomain) return false;
      }

      if (selectedMarkets.length > 0) {
        const hasMarket = comp.positions.some((p) =>
          selectedMarkets.includes(p.market_id)
        );
        if (!hasMarket) return false;
      }

      return true;
    });
  }, [competitors, searchQuery, selectedTypes, selectedDomains, selectedMarkets]);

  const hasActiveFilters =
    searchQuery.length > 0 ||
    selectedTypes.length > 0 ||
    selectedDomains.length > 0 ||
    selectedMarkets.length > 0;

  const clearAllFilters = (): void => {
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedDomains([]);
    setSelectedMarkets([]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Competitors</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {competitors.length} competitors tracked
            {filteredCompetitors.length !== competitors.length && (
              <span>
                {" "}
                &middot; {filteredCompetitors.length} shown
              </span>
            )}
          </p>
        </div>
        <Link href="/competitors/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Competitor
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <CompetitorFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTypes={selectedTypes}
        onToggleType={toggleType}
        selectedDomains={selectedDomains}
        onToggleDomain={toggleDomain}
        selectedMarkets={selectedMarkets}
        onToggleMarket={toggleMarket}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
      />

      {/* Competitor Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredCompetitors.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCompetitors.map((comp) => (
            <CompetitorCard key={comp.id} competitor={comp} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Swords}
          title="No competitors found"
          description={
            hasActiveFilters
              ? "Try adjusting your filters or search query."
              : "No competitors tracked yet. Add your first competitor to get started."
          }
          action={
            hasActiveFilters ? (
              <Button variant="outline" onClick={clearAllFilters}>
                Clear filters
              </Button>
            ) : (
              <Link href="/competitors/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Competitor
                </Button>
              </Link>
            )
          }
        />
      )}
    </div>
  );
}
