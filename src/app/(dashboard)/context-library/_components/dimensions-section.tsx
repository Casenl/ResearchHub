"use client";

import React from "react";

import { cn } from "@/lib/utils";
import { useDomains, useMarkets, useSectors } from "@/hooks/use-taxonomy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DimensionsSectionProps {
  selectedDomains: string[];
  onToggleDomain: (domainId: string) => void;
  selectedMarkets: string[];
  onToggleMarket: (marketId: string) => void;
  selectedSectors: string[];
  onToggleSector: (sectorId: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DimensionsSection({
  selectedDomains,
  onToggleDomain,
  selectedMarkets,
  onToggleMarket,
  selectedSectors,
  onToggleSector,
}: DimensionsSectionProps): React.JSX.Element {
  const { data: domains } = useDomains();
  const { data: markets } = useMarkets();
  const { data: sectors } = useSectors();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dimensions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Domains */}
        <DimensionCheckboxGroup
          label="Domains"
          items={domains}
          selectedIds={selectedDomains}
          onToggle={onToggleDomain}
          activeColorClass="border-purple-300 bg-purple-50 text-purple-800"
        />

        {/* Markets */}
        <DimensionCheckboxGroup
          label="Markets"
          items={markets}
          selectedIds={selectedMarkets}
          onToggle={onToggleMarket}
          activeColorClass="border-blue-300 bg-blue-50 text-blue-800"
        />

        {/* Sectors */}
        <DimensionCheckboxGroup
          label="Sectors"
          items={sectors}
          selectedIds={selectedSectors}
          onToggle={onToggleSector}
          activeColorClass="border-emerald-300 bg-emerald-50 text-emerald-800"
        />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Checkbox group for a single dimension
// ---------------------------------------------------------------------------

interface DimensionCheckboxGroupProps {
  label: string;
  items: { id: string; name: string }[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  activeColorClass: string;
}

function DimensionCheckboxGroup({
  label,
  items,
  selectedIds,
  onToggle,
  activeColorClass,
}: DimensionCheckboxGroupProps): React.JSX.Element {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <label
              key={item.id}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                isSelected
                  ? activeColorClass
                  : "border-border bg-white text-muted-foreground hover:bg-muted/50"
              )}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(item.id)}
                className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              {item.name}
            </label>
          );
        })}
      </div>
    </div>
  );
}
