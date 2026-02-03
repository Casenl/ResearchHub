"use client";

import { useMemo } from "react";
import Link from "next/link";

import { Library, Plus, ArrowRight } from "lucide-react";

import { formatDate } from "@/lib/utils";

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
import { DashboardStats } from "@/components/shared/dashboard-stats";
import { useResearchList } from "@/hooks/use-research";
import { useUsers } from "@/hooks/use-users";

// ---------------------------------------------------------------------------
// Output format labels
// ---------------------------------------------------------------------------

const OUTPUT_FORMAT_DISPLAY: Record<string, string> = {
  factsheet: "Factsheet",
  competitive: "Competitive Analysis",
  proposition: "Proposition Brief",
  full: "Full Report",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardPage(): React.JSX.Element {
  const { data: research } = useResearchList();
  const { data: users } = useUsers();

  const recentPublished = useMemo(
    () =>
      research
        .filter((r) => r.status === "published")
        .sort(
          (a, b) =>
            new Date(b.published_at!).getTime() -
            new Date(a.published_at!).getTime()
        )
        .slice(0, 5),
    [research]
  );

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ITQ Market Intelligence Portal overview
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/research">
              <Library className="mr-1 h-4 w-4" />
              Browse Context Library
            </Link>
          </Button>
          <Button asChild>
            <Link href="/research/new">
              <Plus className="mr-1 h-4 w-4" />
              Start New Research
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview cards */}
      <DashboardStats />

      {/* Recent research */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Research</CardTitle>
            <CardDescription className="mt-1">
              Latest published research items
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/research">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentPublished.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No published research yet.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {recentPublished.map((research) => (
                <Link
                  key={research.id}
                  href={`/research/${research.id}`}
                  className="group block py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold group-hover:text-primary">
                          {research.title}
                        </h3>
                        <StatusBadge status={research.status} />
                      </div>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {research.description}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <DimensionTags
                          dimensions={research.dimensions}
                          compact
                        />
                        <Badge variant="secondary" className="text-[10px]">
                          {OUTPUT_FORMAT_DISPLAY[research.output_format] ??
                            research.output_format}
                        </Badge>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">
                        {research.published_at
                          ? formatDate(research.published_at)
                          : ""}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {users.find((u) => u.id === research.author_id)?.name ?? "Unknown"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
