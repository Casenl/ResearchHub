"use client";

import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

import type { CoverageCellStatus } from "./coverage-cell";

// =============================================================================
// Types
// =============================================================================

interface CoverageStatsProps {
  cellStatuses: CoverageCellStatus[];
}

// =============================================================================
// Stat configuration
// =============================================================================

const STAT_CONFIG = [
  { key: "fresh" as const, label: "Fresh", icon: CheckCircle2, color: "text-green-600" },
  { key: "stale" as const, label: "Stale", icon: AlertTriangle, color: "text-amber-600" },
  { key: "in_progress" as const, label: "In Progress", icon: Clock, color: "text-blue-600" },
  { key: "empty" as const, label: "No Coverage", icon: XCircle, color: "text-red-600" },
];

// =============================================================================
// CoverageStats
// =============================================================================

export function CoverageStats({ cellStatuses }: CoverageStatsProps) {
  const totalCells = cellStatuses.length;

  const counts: Record<CoverageCellStatus, number> = {
    fresh: 0,
    stale: 0,
    in_progress: 0,
    empty: 0,
  };

  for (const status of cellStatuses) {
    counts[status]++;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {STAT_CONFIG.map(({ key, label, icon: Icon, color }) => {
        const count = counts[key];
        const percentage =
          totalCells > 0 ? Math.round((count / totalCells) * 100) : 0;

        return (
          <Card key={key}>
            <CardContent className="flex items-center gap-4 p-4">
              <Icon className={cn("h-8 w-8 shrink-0", color)} />
              <div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">
                  {label} ({percentage}%)
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
