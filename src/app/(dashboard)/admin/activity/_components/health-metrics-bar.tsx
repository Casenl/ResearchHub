"use client";

import { useMemo } from "react";
import { FileText, AlertTriangle, Target, TrendingUp } from "lucide-react";
import { differenceInDays } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MOCK_RESEARCH } from "@/data/mock-research";

import type { ActivityLogEntry } from "@/types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HealthMetricsBarProps {
  activityEntries: ActivityLogEntry[];
}

// ---------------------------------------------------------------------------
// Metric card shape
// ---------------------------------------------------------------------------

interface MetricCard {
  label: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HealthMetricsBar({ activityEntries }: HealthMetricsBarProps) {
  const metrics: MetricCard[] = useMemo(() => {
    // Active research: count of draft / in_progress / review / published
    const activeStatuses = new Set(["draft", "in_progress", "review", "published"]);
    const activeResearchCount = MOCK_RESEARCH.filter((r) =>
      activeStatuses.has(r.status)
    ).length;

    // Weekly activity: count events within last 7 days
    const now = new Date();
    const weeklyCount = activityEntries.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return differenceInDays(now, entryDate) <= 7;
    }).length;

    return [
      {
        label: "Active Research",
        value: activeResearchCount,
        description: "Draft, in progress, review & published",
        icon: FileText,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        label: "Stale Documents",
        value: 3,
        description: "Past freshness threshold",
        icon: AlertTriangle,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
      },
      {
        label: "Coverage Score",
        value: "68%",
        description: "Dimension coverage across research",
        icon: Target,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
      },
      {
        label: "Weekly Activity",
        value: weeklyCount,
        description: "Events in the last 7 days",
        icon: TrendingUp,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
    ];
  }, [activityEntries]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label} className="relative overflow-hidden">
            <CardContent className="flex items-start gap-4 p-5">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  metric.bgColor
                )}
              >
                <Icon className={cn("h-5 w-5", metric.color)} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
                <p className="text-sm font-medium text-foreground">{metric.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
