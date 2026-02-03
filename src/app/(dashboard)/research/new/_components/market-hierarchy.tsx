"use client";

import { Check, Globe } from "lucide-react";

import { cn } from "@/lib/utils";
import { useMarkets } from "@/hooks/use-taxonomy";

import type { Market } from "@/types";

// =============================================================================
// Component
// =============================================================================

export function MarketHierarchy({
  selectedIds,
  onToggle,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
}): React.JSX.Element {
  const { data: markets } = useMarkets();
  const rootMarkets = markets.filter((m) => m.parent_id === null);

  function renderMarket(
    marketId: string,
    depth: number
  ): React.JSX.Element | null {
    const market = markets.find((m) => m.id === marketId);
    if (!market) return null;

    const children = markets.filter((m) => m.parent_id === marketId);
    const isSelected = selectedIds.includes(market.id);

    return (
      <div key={market.id}>
        <button
          type="button"
          onClick={() => onToggle(market.id)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors text-left",
            isSelected
              ? "bg-blue-50 text-blue-800 font-medium"
              : "text-gray-700 hover:bg-gray-50"
          )}
          style={{ paddingLeft: `${depth * 1.25 + 0.75}rem` }}
        >
          <Globe className="h-4 w-4 shrink-0 text-gray-400" />
          <span>{market.name}</span>
          <span className="ml-auto text-xs text-gray-400">{market.code}</span>
          {isSelected && (
            <Check className="h-4 w-4 text-blue-600 shrink-0" />
          )}
        </button>
        {children.map((child) => renderMarket(child.id, depth + 1))}
      </div>
    );
  }

  return (
    <div className="space-y-0.5 rounded-md border border-gray-200 p-2 max-h-72 overflow-y-auto">
      {rootMarkets.map((market) => renderMarket(market.id, 0))}
    </div>
  );
}
