"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Upload,
  FolderOpen,
  FileText,
  AlertTriangle,
  Clock,
  Calendar,
  Shield,
  Cloud,
  Monitor,
  Brain,
} from "lucide-react";

import { cn, formatDate, isExpired, isExpiringSoon } from "@/lib/utils";
import { CONTEXT_CATEGORY_LABELS } from "@/lib/constants";
import { MOCK_CONTEXT_DOCUMENTS } from "@/data/mock-context-documents";
import { DOMAINS } from "@/data/domains";
import { MARKETS } from "@/data/markets";
import type { ContextDocumentCategory } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

// ---------------------------------------------------------------------------
// Category badge color configuration
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<ContextDocumentCategory, string> = {
  service_description: "bg-blue-100 text-blue-800",
  strategy: "bg-purple-100 text-purple-800",
  process_model: "bg-indigo-100 text-indigo-800",
  external_source: "bg-emerald-100 text-emerald-800",
  regulatory: "bg-red-100 text-red-800",
  previous_research: "bg-amber-100 text-amber-800",
};

// ---------------------------------------------------------------------------
// Domain icon mapping
// ---------------------------------------------------------------------------

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  "domain-sec": Shield,
  "domain-hc": Cloud,
  "domain-dw": Monitor,
  "domain-ai": Brain,
};

// ---------------------------------------------------------------------------
// Validity filter options
// ---------------------------------------------------------------------------

type ValidityFilter = "all" | "valid" | "expired" | "expiring_soon";

const VALIDITY_OPTIONS: { value: ValidityFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "valid", label: "Valid only" },
  { value: "expired", label: "Expired" },
  { value: "expiring_soon", label: "Expiring soon" },
];

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ContextLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<
    ContextDocumentCategory[]
  >([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [validityFilter, setValidityFilter] = useState<ValidityFilter>("all");

  // Toggle a category filter
  const toggleCategory = (category: ContextDocumentCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Toggle a domain filter
  const toggleDomain = (domainId: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domainId)
        ? prev.filter((d) => d !== domainId)
        : [...prev, domainId]
    );
  };

  // Toggle a market filter
  const toggleMarket = (marketId: string) => {
    setSelectedMarkets((prev) =>
      prev.includes(marketId)
        ? prev.filter((m) => m !== marketId)
        : [...prev, marketId]
    );
  };

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return MOCK_CONTEXT_DOCUMENTS.filter((doc) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          doc.title.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(doc.category)
      ) {
        return false;
      }

      // Domain filter
      if (selectedDomains.length > 0) {
        const hasMatchingDomain = doc.domain_ids.some((id) =>
          selectedDomains.includes(id)
        );
        if (!hasMatchingDomain) return false;
      }

      // Market filter
      if (selectedMarkets.length > 0) {
        const hasMatchingMarket = doc.market_ids.some((id) =>
          selectedMarkets.includes(id)
        );
        if (!hasMatchingMarket) return false;
      }

      // Validity filter
      if (validityFilter === "valid") {
        if (isExpired(doc.valid_until)) return false;
      } else if (validityFilter === "expired") {
        if (!isExpired(doc.valid_until)) return false;
      } else if (validityFilter === "expiring_soon") {
        if (!isExpiringSoon(doc.valid_until)) return false;
      }

      return true;
    });
  }, [
    searchQuery,
    selectedCategories,
    selectedDomains,
    selectedMarkets,
    validityFilter,
  ]);

  const hasActiveFilters =
    searchQuery.length > 0 ||
    selectedCategories.length > 0 ||
    selectedDomains.length > 0 ||
    selectedMarkets.length > 0 ||
    validityFilter !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedDomains([]);
    setSelectedMarkets([]);
    setValidityFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Context Library
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {MOCK_CONTEXT_DOCUMENTS.length} documents available
            {filteredDocuments.length !== MOCK_CONTEXT_DOCUMENTS.length && (
              <span>
                {" "}
                &middot; {filteredDocuments.length} shown
              </span>
            )}
          </p>
        </div>
        <Link href="/context-library/new">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search documents by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
                onClick={() => toggleCategory(key)}
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

        {/* Domain & Market Filters */}
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
                  onClick={() => toggleDomain(domain.id)}
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
                  onClick={() => toggleMarket(market.id)}
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
                  onClick={() => setValidityFilter(option.value)}
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
              onClick={clearAllFilters}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Document Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDocuments.map((doc) => {
            const expired = isExpired(doc.valid_until);
            const expiringSoon = !expired && isExpiringSoon(doc.valid_until);

            // Resolve domain/market names
            const domainNames = doc.domain_ids.map((id) => {
              const domain = DOMAINS.find((d) => d.id === id);
              return domain?.name ?? id;
            });
            const marketNames = doc.market_ids.map((id) => {
              const market = MARKETS.find((m) => m.id === id);
              return market?.name ?? id;
            });

            // Pick a domain icon for the card
            const PrimaryIcon =
              doc.domain_ids.length > 0
                ? DOMAIN_ICONS[doc.domain_ids[0]] ?? FileText
                : FileText;

            return (
              <Link
                key={doc.id}
                href={`/context-library/${doc.id}`}
                className="group"
              >
                <Card
                  className={cn(
                    "h-full transition-shadow hover:shadow-md",
                    expired && "border-red-200 bg-red-50/30",
                    expiringSoon && "border-amber-200 bg-amber-50/30"
                  )}
                >
                  <CardContent className="p-5">
                    {/* Top Row: Icon + Category Badge + Status */}
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                          <PrimaryIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Badge
                          className={cn("px-2 py-0.5 text-xs", CATEGORY_COLORS[doc.category])}
                        >
                          {CONTEXT_CATEGORY_LABELS[doc.category]}
                        </Badge>
                      </div>
                      {expired && (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-xs font-medium">Expired</span>
                        </div>
                      )}
                      {expiringSoon && (
                        <div className="flex items-center gap-1 text-amber-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs font-medium">
                            Expiring soon
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="mb-1.5 text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {doc.title}
                    </h3>

                    {/* Description */}
                    <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
                      {doc.description}
                    </p>

                    {/* Dimension Tags */}
                    <div className="mb-3 flex flex-wrap gap-1">
                      {domainNames.map((name) => (
                        <Badge
                          key={name}
                          className="px-2 py-0.5 text-xs bg-purple-50 text-purple-700"
                        >
                          {name}
                        </Badge>
                      ))}
                      {marketNames.map((name) => (
                        <Badge
                          key={name}
                          className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700"
                        >
                          {name}
                        </Badge>
                      ))}
                    </div>

                    {/* Validity Dates */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {formatDate(doc.valid_from)} &ndash;{" "}
                        {formatDate(doc.valid_until)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="No documents found"
          description={
            hasActiveFilters
              ? "Try adjusting your filters or search query to find documents."
              : "Upload your first context document to get started."
          }
          action={
            hasActiveFilters ? (
              <Button variant="outline" onClick={clearAllFilters}>
                Clear filters
              </Button>
            ) : (
              <Link href="/context-library/new">
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </Link>
            )
          }
        />
      )}
    </div>
  );
}
