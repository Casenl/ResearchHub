"use client";

import React from "react";
import { Pencil, Trash2, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Legislation, Market, Sector } from "@/types";

// =============================================================================
// Scope badge colors
// =============================================================================

const SCOPE_STYLES: Record<string, string> = {
  national: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  eu: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  international: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

// =============================================================================
// Component
// =============================================================================

interface LegislationTableProps {
  items: Legislation[];
  markets: Market[];
  sectors: Sector[];
  onEdit: (item: Legislation) => void;
  onDelete: (item: Legislation) => void;
}

export function LegislationTable({
  items,
  markets,
  sectors,
  onEdit,
  onDelete,
}: LegislationTableProps): React.JSX.Element {
  const marketName = (id: string) =>
    markets.find((m) => m.id === id)?.name ?? id;
  const sectorName = (id: string) =>
    sectors.find((s) => s.id === id)?.name ?? id;

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No legislation entries yet. Add one to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Legislation Registry ({items.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Scope</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Markets</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Sectors</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Effective Date</th>
                <th className="px-4 py-3 font-medium text-muted-foreground sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{item.name}</span>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    {item.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                        {item.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={SCOPE_STYLES[item.scope] ?? ""}
                    >
                      {item.scope}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.market_ids.map((id) => (
                        <Badge key={id} variant="outline" className="text-xs">
                          {marketName(id)}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.sector_ids.map((id) => (
                        <Badge key={id} variant="outline" className="text-xs">
                          {sectorName(id)}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {item.effective_date}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEdit(item)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
