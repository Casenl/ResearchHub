"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DOMAINS } from "@/data/domains";
import { MARKETS } from "@/data/markets";
import { SECTORS } from "@/data/sectors";

import {
  ALL_STATUSES,
  ALL_OUTPUT_FORMATS,
  EXCLUDED_MARKET_IDS,
} from "./constants";

import type { ResearchStatus, OutputFormat } from "@/types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ResearchFilterPanelProps {
  selectedStatuses: ResearchStatus[];
  selectedDomains: string[];
  selectedMarkets: string[];
  selectedSectors: string[];
  selectedFormats: OutputFormat[];
  dateFilter: "all" | "recent";
  onToggleStatus: (status: ResearchStatus) => void;
  onToggleDomain: (domainId: string) => void;
  onToggleMarket: (marketId: string) => void;
  onToggleSector: (sectorId: string) => void;
  onToggleFormat: (format: OutputFormat) => void;
  onDateFilterChange: (value: "all" | "recent") => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function filterChipClass(isSelected: boolean, activeColor: string): string {
  return `rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
    isSelected ? activeColor : "border-border text-muted-foreground hover:bg-muted"
  }`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface FilterGroupProps {
  label: string;
  children: React.ReactNode;
}

function FilterGroup({ label, children }: FilterGroupProps): React.JSX.Element {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ResearchFilterPanel({
  selectedStatuses,
  selectedDomains,
  selectedMarkets,
  selectedSectors,
  selectedFormats,
  dateFilter,
  onToggleStatus,
  onToggleDomain,
  onToggleMarket,
  onToggleSector,
  onToggleFormat,
  onDateFilterChange,
}: ResearchFilterPanelProps): React.JSX.Element {
  const filteredMarkets = MARKETS.filter((m) => !EXCLUDED_MARKET_IDS.has(m.id));

  return (
    <Card>
      <CardContent className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Status */}
        <FilterGroup label="Status">
          {ALL_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => onToggleStatus(s.value)}
              className={filterChipClass(
                selectedStatuses.includes(s.value),
                "border-primary bg-primary/10 text-primary",
              )}
            >
              {s.label}
            </button>
          ))}
        </FilterGroup>

        {/* Domain */}
        <FilterGroup label="Domain">
          {DOMAINS.map((d) => (
            <button
              key={d.id}
              onClick={() => onToggleDomain(d.id)}
              className={filterChipClass(
                selectedDomains.includes(d.id),
                "border-violet-400 bg-violet-50 text-violet-700",
              )}
            >
              {d.name}
            </button>
          ))}
        </FilterGroup>

        {/* Market */}
        <FilterGroup label="Market">
          {filteredMarkets.map((m) => (
            <button
              key={m.id}
              onClick={() => onToggleMarket(m.id)}
              className={filterChipClass(
                selectedMarkets.includes(m.id),
                "border-sky-400 bg-sky-50 text-sky-700",
              )}
            >
              {m.name}
            </button>
          ))}
        </FilterGroup>

        {/* Sector */}
        <FilterGroup label="Sector">
          {SECTORS.map((s) => (
            <button
              key={s.id}
              onClick={() => onToggleSector(s.id)}
              className={filterChipClass(
                selectedSectors.includes(s.id),
                "border-emerald-400 bg-emerald-50 text-emerald-700",
              )}
            >
              {s.name}
            </button>
          ))}
        </FilterGroup>

        {/* Output format */}
        <FilterGroup label="Output Format">
          {ALL_OUTPUT_FORMATS.map((f) => (
            <button
              key={f.value}
              onClick={() => onToggleFormat(f.value)}
              className={filterChipClass(
                selectedFormats.includes(f.value),
                "border-primary bg-primary/10 text-primary",
              )}
            >
              {f.label}
            </button>
          ))}
        </FilterGroup>

        {/* Date range */}
        <FilterGroup label="Date Range">
          <button
            onClick={() => onDateFilterChange("all")}
            className={filterChipClass(
              dateFilter === "all",
              "border-primary bg-primary/10 text-primary",
            )}
          >
            All Time
          </button>
          <button
            onClick={() => onDateFilterChange("recent")}
            className={filterChipClass(
              dateFilter === "recent",
              "border-primary bg-primary/10 text-primary",
            )}
          >
            Last 6 Months
          </button>
        </FilterGroup>
      </CardContent>
    </Card>
  );
}
