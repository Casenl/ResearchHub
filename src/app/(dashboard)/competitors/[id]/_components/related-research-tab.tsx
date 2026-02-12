"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";

import { formatDate } from "@/lib/utils";
import { RESEARCH_STATUS_LABELS, OUTPUT_FORMAT_LABELS } from "@/lib/constants";
import { useResearchList } from "@/hooks/use-research";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { DimensionTags } from "@/components/shared/dimension-tags";

import type { Competitor } from "@/types";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface RelatedResearchTabProps {
  competitor: Competitor;
}

export function RelatedResearchTab({
  competitor,
}: RelatedResearchTabProps): React.JSX.Element {
  const { data: allResearch } = useResearchList();

  // Find research that shares market+domain combinations with this competitor's positions
  const relatedResearch = useMemo(() => {
    const positionKeys = new Set(
      competitor.positions.map((p) => `${p.market_id}:${p.domain_id}`)
    );

    if (positionKeys.size === 0) return [];

    return allResearch.filter((r) => {
      const marketIds = r.dimensions.markets.map((m) => m.id);
      const domainIds = r.dimensions.domains.map((d) => d.id);

      return marketIds.some((mid) =>
        domainIds.some((did) => positionKeys.has(`${mid}:${did}`))
      );
    });
  }, [allResearch, competitor.positions]);

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">
        Related Research ({relatedResearch.length})
      </h3>

      {relatedResearch.length > 0 ? (
        <div className="space-y-3">
          {relatedResearch.map((research) => (
            <Link
              key={research.id}
              href={`/research/${research.id}`}
              className="group block"
            >
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {research.title}
                      </h4>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge className="px-2 py-0 text-[10px] bg-muted text-foreground">
                          {RESEARCH_STATUS_LABELS[research.status]}
                        </Badge>
                        <Badge className="px-2 py-0 text-[10px] bg-muted text-foreground">
                          {OUTPUT_FORMAT_LABELS[research.output_format]}
                        </Badge>
                        <span>{formatDate(research.updated_at)}</span>
                      </div>
                      <div className="mt-2">
                        <DimensionTags
                          dimensions={research.dimensions}
                          compact
                        />
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No related research"
          description="Research items that share the same market and domain combinations as this competitor's positions will appear here."
        />
      )}
    </div>
  );
}
