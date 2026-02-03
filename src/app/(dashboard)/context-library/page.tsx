"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Upload, FolderOpen } from "lucide-react";

import { isExpired, isExpiringSoon } from "@/lib/utils";
import { MOCK_CONTEXT_DOCUMENTS } from "@/data/mock-context-documents";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

import { DocumentFilterBar } from "./_components/document-filter-bar";
import { DocumentCard } from "./_components/document-card";

import type { ContextDocumentCategory } from "@/types";
import type { ValidityFilter } from "./_components/document-filter-bar";

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ContextLibraryPage(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<
    ContextDocumentCategory[]
  >([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [validityFilter, setValidityFilter] = useState<ValidityFilter>("all");

  // Toggle helpers
  const toggleCategory = (category: ContextDocumentCategory): void => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
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

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return MOCK_CONTEXT_DOCUMENTS.filter((doc) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const hasSearchMatch =
          doc.title.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query);
        if (!hasSearchMatch) return false;
      }

      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(doc.category)
      ) {
        return false;
      }

      if (selectedDomains.length > 0) {
        const hasMatchingDomain = doc.domain_ids.some((id) =>
          selectedDomains.includes(id)
        );
        if (!hasMatchingDomain) return false;
      }

      if (selectedMarkets.length > 0) {
        const hasMatchingMarket = doc.market_ids.some((id) =>
          selectedMarkets.includes(id)
        );
        if (!hasMatchingMarket) return false;
      }

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

  const clearAllFilters = (): void => {
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

      {/* Filter Bar */}
      <DocumentFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
        selectedDomains={selectedDomains}
        onToggleDomain={toggleDomain}
        selectedMarkets={selectedMarkets}
        onToggleMarket={toggleMarket}
        validityFilter={validityFilter}
        onValidityChange={setValidityFilter}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
      />

      {/* Document Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
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
