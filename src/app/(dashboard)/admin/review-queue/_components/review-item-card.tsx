import Link from "next/link";
import { format } from "date-fns";
import { Loader2, Check, X, Bot, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProvenanceBadge } from "@/components/shared/provenance-badge";
import { TrustTierBadge } from "@/components/shared/trust-tier-badge";

import type { Research, QualityTier } from "@/types";

// =============================================================================
// Types
// =============================================================================

export type ReviewItem = Research & { id: string };

// =============================================================================
// Helpers
// =============================================================================

function computeSourceStats(item: ReviewItem): {
  count: number;
  avgTier: QualityTier;
} {
  const sources = item.notebooks?.flatMap((n) => n.sources) ?? [];
  if (sources.length === 0) return { count: 0, avgTier: 8 as QualityTier };

  const avg = Math.round(
    sources.reduce((sum, s) => sum + s.quality_tier, 0) / sources.length
  );
  return {
    count: sources.length,
    avgTier: Math.max(1, Math.min(8, avg)) as QualityTier,
  };
}

// =============================================================================
// ReviewItemCard
// =============================================================================

interface ReviewItemCardProps {
  item: ReviewItem;
  isActioning: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ReviewItemCard({
  item,
  isActioning,
  onApprove,
  onReject,
}: ReviewItemCardProps): React.JSX.Element {
  const { count, avgTier } = computeSourceStats(item);

  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-5">
        <Bot className="mt-0.5 size-5 shrink-0 text-purple-500" />

        <div className="min-w-0 flex-1 space-y-2">
          {/* Title row */}
          <div className="flex items-center gap-2">
            <Link
              href={`/research/${item.id}`}
              className="flex items-center gap-1.5 truncate font-semibold text-foreground hover:text-blue-600 hover:underline dark:hover:text-blue-400"
            >
              {item.title}
              <ExternalLink className="size-3.5 shrink-0 opacity-50" />
            </Link>
            <ProvenanceBadge origin={item.origin} />
          </div>

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {item.agent_identity && (
              <span>Agent: {item.agent_identity.agent_name}</span>
            )}
            <span>
              Created{" "}
              {item.created_at
                ? format(new Date(item.created_at), "dd MMM yyyy")
                : "N/A"}
            </span>
            <span className="flex items-center gap-1">
              {count} source{count !== 1 && "s"}
              {count > 0 && (
                <>
                  {" "}
                  &middot; avg <TrustTierBadge tier={avgTier} />
                </>
              )}
            </span>
          </div>

          {/* Synthesis preview */}
          {item.synthesis && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {item.synthesis.slice(0, 200)}
              {item.synthesis.length > 200 && "..."}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-green-600 hover:bg-green-50 hover:text-green-700"
            disabled={isActioning}
            onClick={() => onApprove(item.id)}
          >
            {isActioning ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            disabled={isActioning}
            onClick={() => onReject(item.id)}
          >
            {isActioning ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <X className="size-3.5" />
            )}
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
