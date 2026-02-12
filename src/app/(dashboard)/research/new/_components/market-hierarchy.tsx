"use client";

import { Check, Globe } from "lucide-react";

import { cn } from "@/lib/utils";
import { useMarkets } from "@/hooks/use-taxonomy";

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
              ? "bg-blue-50 text-blue-800 font-medium dark:bg-blue-950 dark:text-blue-200"
              : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
          )}
          style={{ paddingLeft: `${depth * 1.25 + 0.75}rem` }}
        >
          <Globe className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
          <span>{market.name}</span>
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{market.code}</span>
          {isSelected && (
            <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          )}
        </button>
        {children.map((child) => renderMarket(child.id, depth + 1))}
      </div>
    );
  }

  return (
    <div className="space-y-0.5 rounded-md border border-gray-200 dark:border-gray-700 p-2 max-h-72 overflow-y-auto">
      {rootMarkets.map((market) => renderMarket(market.id, 0))}
    </div>
  );
}
