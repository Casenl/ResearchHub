"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  AlertTriangle,
  Clock,
  Calendar,
  Shield,
  Cloud,
  Monitor,
  Brain,
} from "lucide-react";

import { cn, formatDate, isExpired, isExpiringSoon } from "@/lib/utils";
import { CONTEXT_CATEGORY_LABELS } from "@/lib/constants";
import { useDomains, useMarkets } from "@/hooks/use-taxonomy";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { CATEGORY_COLORS } from "./category-colors";

import type { ContextDocument } from "@/types";

// ---------------------------------------------------------------------------
// Domain icon mapping
// ---------------------------------------------------------------------------

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  "domain-sec": Shield,
  "domain-hc": Cloud,
  "domain-dw": Monitor,
  "domain-ai": Brain,
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DocumentCardProps {
  document: ContextDocument;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DocumentCard({ document: doc }: DocumentCardProps): React.JSX.Element {
  const { data: domains } = useDomains();
  const { data: markets } = useMarkets();

  const isDocExpired = isExpired(doc.valid_until);
  const isDocExpiringSoon = !isDocExpired && isExpiringSoon(doc.valid_until);

  // Resolve domain / market names
  const domainNames = doc.domain_ids.map((id) => {
    const domain = domains.find((d) => d.id === id);
    return domain?.name ?? id;
  });
  const marketNames = doc.market_ids.map((id) => {
    const market = markets.find((m) => m.id === id);
    return market?.name ?? id;
  });

  // Pick a domain icon for the card
  const PrimaryIcon =
    doc.domain_ids.length > 0
      ? DOMAIN_ICONS[doc.domain_ids[0]] ?? FileText
      : FileText;

  return (
    <Link href={`/context-library/${doc.id}`} className="group">
      <Card
        className={cn(
          "h-full transition-shadow hover:shadow-md",
          isDocExpired && "border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/30",
          isDocExpiringSoon && "border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/30"
        )}
      >
        <CardContent className="p-5">
          {/* Top Row: Icon + Category Badge + Status */}
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                <PrimaryIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <Badge
                className={cn(
                  "px-2 py-0.5 text-xs",
                  CATEGORY_COLORS[doc.category]
                )}
              >
                {CONTEXT_CATEGORY_LABELS[doc.category]}
              </Badge>
            </div>
            {isDocExpired && (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs font-medium">Expired</span>
              </div>
            )}
            {isDocExpiringSoon && (
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Expiring soon</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="mb-1.5 text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {doc.title}
          </h3>

          {/* Description */}
          <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
            {doc.description}
          </p>

          {/* Dimension Tags */}
          <div className="mb-3 flex flex-wrap gap-1">
            {domainNames.map((name) => (
              <Badge
                key={name}
                className="px-2 py-0.5 text-xs bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-200"
              >
                {name}
              </Badge>
            ))}
            {marketNames.map((name) => (
              <Badge
                key={name}
                className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
              >
                {name}
              </Badge>
            ))}
          </div>

          {/* Validity Dates */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {formatDate(doc.valid_from)} &ndash; {formatDate(doc.valid_until)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
