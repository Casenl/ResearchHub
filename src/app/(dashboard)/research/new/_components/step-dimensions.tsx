"use client";

import React from "react";
import { Check, X, Shield, Building2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMarkets, useDomains, useSectors } from "@/hooks/use-taxonomy";

import { MarketHierarchy } from "./market-hierarchy";
import { DOMAIN_ICONS, SECTOR_ICONS } from "./wizard-types";

import type { WizardStepProps } from "./wizard-types";

// =============================================================================
// Component
// =============================================================================

export function StepDimensions({
  form,
  onUpdate,
  onToggleArrayItem,
}: WizardStepProps): React.JSX.Element {
  const { data: MARKETS } = useMarkets();
  const { data: DOMAINS } = useDomains();
  const { data: SECTORS } = useSectors();

  const selectedMarkets = MARKETS.filter((m) =>
    form.selectedMarketIds.includes(m.id)
  );
  const selectedDomains = DOMAINS.filter((d) =>
    form.selectedDomainIds.includes(d.id)
  );
  const selectedSectors = form.allSectors
    ? SECTORS
    : SECTORS.filter((s) => form.selectedSectorIds.includes(s.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Dimensions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Markets */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Markets</label>
          <p className="text-xs text-gray-500">
            Select one or more geographic markets for this research.
          </p>
          <MarketHierarchy
            selectedIds={form.selectedMarketIds}
            onToggle={(id) => onToggleArrayItem?.("selectedMarketIds", id)}
          />
          {selectedMarkets.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedMarkets.map((m) => (
                <Badge
                  key={m.id}
                  variant="default"
                  className="px-2.5 py-0.5 text-sm gap-1.5 cursor-pointer"
                  onClick={() =>
                    onToggleArrayItem?.("selectedMarketIds", m.id)
                  }
                >
                  {m.name}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Domains */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Domains</label>
          <p className="text-xs text-gray-500">
            Select the technology domains to investigate.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {DOMAINS.map((domain) => {
              const Icon = DOMAIN_ICONS[domain.id] ?? Shield;
              const isSelected = form.selectedDomainIds.includes(domain.id);
              return (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() =>
                    onToggleArrayItem?.("selectedDomainIds", domain.id)
                  }
                  className={cn(
                    "flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors",
                    isSelected
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 mt-0.5 shrink-0",
                      isSelected ? "text-blue-600" : "text-gray-400"
                    )}
                  />
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold text-gray-900">
                      {domain.name}
                    </span>
                    <span className="block text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {domain.description}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-blue-600 shrink-0 ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
          {selectedDomains.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedDomains.map((d) => (
                <Badge
                  key={d.id}
                  variant="info"
                  className="px-2.5 py-0.5 text-sm gap-1.5 cursor-pointer"
                  onClick={() =>
                    onToggleArrayItem?.("selectedDomainIds", d.id)
                  }
                >
                  {d.name}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Sectors */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Sectors</label>
          <p className="text-xs text-gray-500">
            Select specific sectors or include all.
          </p>

          {/* All sectors toggle */}
          <button
            type="button"
            onClick={() =>
              onUpdate({
                allSectors: !form.allSectors,
                selectedSectorIds: [],
              })
            }
            className={cn(
              "flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors w-full",
              form.allSectors
                ? "border-blue-600 bg-blue-50 text-blue-800"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            )}
          >
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                form.allSectors
                  ? "border-blue-600 bg-blue-600"
                  : "border-gray-300"
              )}
            >
              {form.allSectors && <Check className="h-3 w-3 text-white" />}
            </div>
            All Sectors
          </button>

          {!form.allSectors && (
            <div className="grid grid-cols-2 gap-2">
              {SECTORS.map((sector) => {
                const Icon = SECTOR_ICONS[sector.id] ?? Building2;
                const isSelected = form.selectedSectorIds.includes(sector.id);
                return (
                  <button
                    key={sector.id}
                    type="button"
                    onClick={() =>
                      onToggleArrayItem?.("selectedSectorIds", sector.id)
                    }
                    className={cn(
                      "flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-sm text-left transition-colors",
                      isSelected
                        ? "border-blue-600 bg-blue-50 text-blue-800 font-medium"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                    <span>{sector.name}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-blue-600 shrink-0 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {!form.allSectors && selectedSectors.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedSectors.map((s) => (
                <Badge
                  key={s.id}
                  variant="warning"
                  className="px-2.5 py-0.5 text-sm gap-1.5 cursor-pointer"
                  onClick={() =>
                    onToggleArrayItem?.("selectedSectorIds", s.id)
                  }
                >
                  {s.name}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
