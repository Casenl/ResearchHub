"use client";

import React from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { CONTEXT_CATEGORY_LABELS } from "@/lib/constants";
import { DOMAINS } from "@/data/domains";
import { MARKETS } from "@/data/markets";
import { Input } from "@/components/ui/input";

import { CATEGORY_COLORS } from "./category-colors";

import type { ContextDocumentCategory } from "@/types";

// ---------------------------------------------------------------------------
// Validity filter type & options
// ---------------------------------------------------------------------------

export type ValidityFilter = "all" | "valid" | "expired" | "expiring_soon";

const VALIDITY_OPTIONS: { value: ValidityFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "valid", label: "Valid only" },
  { value: "expired", label: "Expired" },
  { value: "expiring_soon", label: "Expiring soon" },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DocumentFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategories: ContextDocumentCategory[];
  onToggleCategory: (category: ContextDocumentCategory) => void;
  selectedDomains: string[];
  onToggleDomain: (domainId: string) => void;
  selectedMarkets: string[];
  onToggleMarket: (marketId: string) => void;
  validityFilter: ValidityFilter;
  onValidityChange: (filter: ValidityFilter) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DocumentFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategories,
  onToggleCategory,
  selectedDomains,
  onToggleDomain,
  selectedMarkets,
  onToggleMarket,
  validityFilter,
  onValidityChange,
  hasActiveFilters,
  onClearFilters,
}: DocumentFilterBarProps): React.JSX.Element {
  return (
    <>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search documents by title or description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="space-y-4 rounded-lg border border-border bg-white p-4">
        {/* Category Pills */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Category
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              Object.entries(CONTEXT_CATEGORY_LABELS) as [
                ContextDocumentCategory,
                string,
              ][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => onToggleCategory(key)}
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  selectedCategories.includes(key)
                    ? CATEGORY_COLORS[key]
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Domain & Market & Validity Filters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {market.name}
                </button>
              ))}
            </div>
          </div>

          {/* Validity Filter */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Validity
            </p>
            <div className="flex flex-wrap gap-2">
              {VALIDITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onValidityChange(option.value)}
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    validityFilter === option.value
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {option.label}
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
