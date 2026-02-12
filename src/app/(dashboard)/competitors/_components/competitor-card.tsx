"use client";

import React from "react";
import Link from "next/link";
import { Globe, MapPin, Calendar } from "lucide-react";

import { cn, formatDate } from "@/lib/utils";
import { COMPETITOR_TYPE_LABELS } from "@/lib/constants";
import { useMarkets, useDomains } from "@/hooks/use-taxonomy";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import type { Competitor } from "@/types";

// ---------------------------------------------------------------------------
// Type color mapping
// ---------------------------------------------------------------------------

const TYPE_COLORS: Record<string, string> = {
  msp: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200",
  vendor_partner:
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
  both: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-200",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CompetitorCardProps {
  competitor: Competitor;
}

export function CompetitorCard({
  competitor,
}: CompetitorCardProps): React.JSX.Element {
  const { data: markets } = useMarkets();
  const { data: domains } = useDomains();

  const hqMarket = markets.find(
    (m) => m.id === competitor.headquarters_market_id
  );

  // Unique domains across all positions
  const activeDomainIds = [
    ...new Set(competitor.positions.map((p) => p.domain_id)),
  ];
  const activeDomainNames = activeDomainIds.map((id) => {
    const domain = domains.find((d) => d.id === id);
    return domain?.name ?? id;
  });

  // Latest event date
  const latestEvent =
    competitor.events.length > 0
      ? competitor.events.reduce((a, b) =>
          a.date > b.date ? a : b
        )
      : null;

  return (
    <Link href={`/competitors/${competitor.id}`} className="group">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          {/* Top Row: Name + Type */}
          <div className="mb-3 flex items-start justify-between">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {competitor.name}
            </h3>
            <Badge
              className={cn(
                "ml-2 shrink-0 px-2 py-0.5 text-xs",
                TYPE_COLORS[competitor.type]
              )}
            >
              {COMPETITOR_TYPE_LABELS[competitor.type]}
            </Badge>
          </div>

          {/* Description */}
          <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
            {competitor.description}
          </p>

          {/* HQ + Website */}
          <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
            {hqMarket && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {hqMarket.name}
              </span>
            )}
            {competitor.website && (
              <span className="inline-flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                <span className="truncate max-w-[120px]">
                  {competitor.website.replace(/^https?:\/\//, "")}
                </span>
              </span>
            )}
          </div>

          {/* Domain badges */}
          {activeDomainNames.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {activeDomainNames.map((name) => (
                <Badge
                  key={name}
                  className="px-2 py-0.5 text-xs bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-200"
                >
                  {name}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              {competitor.positions.length}{" "}
              {competitor.positions.length === 1 ? "position" : "positions"}
            </span>
            <span>
              {competitor.events.length}{" "}
              {competitor.events.length === 1 ? "event" : "events"}
            </span>
            {latestEvent && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(latestEvent.date)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
