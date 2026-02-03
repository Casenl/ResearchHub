"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Library,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { DimensionTags } from "@/components/shared/dimension-tags";
import { MOCK_RESEARCH, MOCK_AUTHORS } from "@/data/mock-research";
import { formatDate } from "@/lib/utils";
import type { ResearchStatus, OutputFormat } from "@/types";
import { DOMAINS } from "@/data/domains";
import { MARKETS } from "@/data/markets";
import { SECTORS } from "@/data/sectors";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALL_STATUSES: { value: ResearchStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "In Review" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const OUTPUT_FORMAT_DISPLAY: Record<string, string> = {
  factsheet: "Factsheet",
  competitive: "Competitive Analysis",
  proposition: "Proposition Brief",
  full: "Full Report",
};

const ALL_OUTPUT_FORMATS: { value: OutputFormat; label: string }[] = [
  { value: "factsheet", label: "Factsheet" },
  { value: "competitive", label: "Competitive Analysis" },
  { value: "proposition", label: "Proposition Brief" },
  { value: "full", label: "Full Report" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ResearchLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ResearchStatus[]>(
    []
  );
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<OutputFormat[]>([]);
  const [dateFilter, setDateFilter] = useState<"all" | "recent">("all");
  const [showFilters, setShowFilters] = useState(false);

  const toggleStatus = (status: ResearchStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const toggleDomain = (domainId: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domainId)
        ? prev.filter((d) => d !== domainId)
        : [...prev, domainId]
    );
  };

  const toggleMarket = (marketId: string) => {
    setSelectedMarkets((prev) =>
      prev.includes(marketId)
        ? prev.filter((m) => m !== marketId)
        : [...prev, marketId]
    );
  };

  const toggleSector = (sectorId: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sectorId)
        ? prev.filter((s) => s !== sectorId)
        : [...prev, sectorId]
    );
  };

  const toggleFormat = (format: OutputFormat) => {
    setSelectedFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format]
    );
  };

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSelectedDomains([]);
    setSelectedMarkets([]);
    setSelectedSectors([]);
    setSelectedFormats([]);
    setDateFilter("all");
    setSearchQuery("");
  };

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
          r.description.toLowerCase().includes(q)
      );
    }

    if (selectedStatuses.length > 0) {
      results = results.filter((r) => selectedStatuses.includes(r.status));
    }

    if (selectedDomains.length > 0) {
      results = results.filter((r) =>
        r.dimensions.domains.some((d) => selectedDomains.includes(d.id))
      );
    }

    if (selectedMarkets.length > 0) {
      results = results.filter((r) =>
        r.dimensions.markets.some((m) => selectedMarkets.includes(m.id))
      );
    }

    if (selectedSectors.length > 0) {
      results = results.filter((r) =>
        r.dimensions.sectors.some((s) => selectedSectors.includes(s.id))
      );
    }

    if (selectedFormats.length > 0) {
      results = results.filter((r) =>
        selectedFormats.includes(r.output_format)
      );
    }

    if (dateFilter === "recent") {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      results = results.filter(
        (r) => new Date(r.updated_at) >= sixMonthsAgo
      );
    }

    results.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Research Library
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredResearch.length} of {MOCK_RESEARCH.length} research items
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
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button
          variant={showFilters ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
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
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <Card>
          <CardContent className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Status */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </h3>
              <div className="flex flex-wrap gap-2">
                {ALL_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => toggleStatus(s.value)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                      selectedStatuses.includes(s.value)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Domain */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Domain
              </h3>
              <div className="flex flex-wrap gap-2">
                {DOMAINS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => toggleDomain(d.id)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                      selectedDomains.includes(d.id)
                        ? "border-violet-400 bg-violet-50 text-violet-700"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Market */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Market
              </h3>
              <div className="flex flex-wrap gap-2">
                {MARKETS.filter(
                  (m) =>
                    m.id !== "market-glb" &&
                    m.id !== "market-dach" &&
                    m.id !== "market-de" &&
                    m.id !== "market-at" &&
                    m.id !== "market-ch" &&
                    m.id !== "market-fr" &&
                    m.id !== "market-uk"
                ).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => toggleMarket(m.id)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                      selectedMarkets.includes(m.id)
                        ? "border-sky-400 bg-sky-50 text-sky-700"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sector */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sector
              </h3>
              <div className="flex flex-wrap gap-2">
                {SECTORS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSector(s.id)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                      selectedSectors.includes(s.id)
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Output format */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Output Format
              </h3>
              <div className="flex flex-wrap gap-2">
                {ALL_OUTPUT_FORMATS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => toggleFormat(f.value)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                      selectedFormats.includes(f.value)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date range */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Date Range
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setDateFilter("all")}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                    dateFilter === "all"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setDateFilter("recent")}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                    dateFilter === "recent"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Last 6 Months
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Research cards */}
      {filteredResearch.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Library className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              No research found
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredResearch.map((research) => (
            <Link
              key={research.id}
              href={`/research/${research.id}`}
              className="group block"
            >
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-base group-hover:text-primary">
                      {research.title}
                    </CardTitle>
                    <StatusBadge status={research.status} />
                  </div>
                  <CardDescription className="line-clamp-2">
                    {research.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <DimensionTags
                      dimensions={research.dimensions}
                      compact
                    />

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {OUTPUT_FORMAT_DISPLAY[research.output_format] ??
                          research.output_format}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {MOCK_AUTHORS[research.author_id] ?? "Unknown"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(research.updated_at)}
                      </span>
                      {research.type !== "new" && (
                        <Badge
                          variant="outline"
                          className="text-[10px] capitalize"
                        >
                          {research.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
