"use client";

import React from "react";
import { Globe, MapPin, Users, DollarSign, CalendarDays } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { COMPETITOR_TYPE_LABELS, PACKAGING_MODEL_LABELS } from "@/lib/constants";
import { useMarkets, useDomains } from "@/hooks/use-taxonomy";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import type { Competitor } from "@/types";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface OverviewTabProps {
  competitor: Competitor;
}

export function OverviewTab({ competitor }: OverviewTabProps): React.JSX.Element {
  const { data: markets } = useMarkets();
  const { data: domains } = useDomains();

  const hqMarket = markets.find(
    (m) => m.id === competitor.headquarters_market_id
  );

  // Aggregate vendor partnerships across positions
  const allVendors = [
    ...new Set(competitor.positions.flatMap((p) => p.vendor_partnerships)),
  ];

  // Aggregate unique domains
  const activeDomainIds = [
    ...new Set(competitor.positions.map((p) => p.domain_id)),
  ];
  const activeDomains = activeDomainIds.map((id) => {
    const domain = domains.find((d) => d.id === id);
    return domain?.name ?? id;
  });

  // Aggregate unique markets
  const activeMarketIds = [
    ...new Set(competitor.positions.map((p) => p.market_id)),
  ];
  const activeMarkets = activeMarketIds.map((id) => {
    const market = markets.find((m) => m.id === id);
    return market?.name ?? id;
  });

  // Aggregate packaging models
  const packagingModels = [
    ...new Set(competitor.positions.map((p) => p.packaging_model)),
  ];

  return (
    <div className="mt-6 space-y-6">
      {/* Description */}
      {competitor.description && (
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Description
            </h3>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
              <ReactMarkdown>{competitor.description}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Headquarters
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {hqMarket?.name ?? "Not specified"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Employees
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {competitor.employee_range || "Not specified"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Revenue
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {competitor.revenue_range || "Not specified"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Founded
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {competitor.founded_year ?? "Not specified"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Active Markets */}
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Active Markets
            </h3>
            {activeMarkets.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {activeMarkets.map((name) => (
                  <Badge
                    key={name}
                    className="px-2 py-0.5 text-xs bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-200"
                  >
                    {name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No positions tracked yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Active Domains */}
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Active Domains
            </h3>
            {activeDomains.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {activeDomains.map((name) => (
                  <Badge
                    key={name}
                    className="px-2 py-0.5 text-xs bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-200"
                  >
                    {name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No positions tracked yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Vendor Partnerships */}
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Vendor Partnerships
            </h3>
            {allVendors.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {allVendors.map((vendor) => (
                  <Badge
                    key={vendor}
                    className="px-2 py-0.5 text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
                  >
                    {vendor}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No vendor partnerships recorded
              </p>
            )}
          </CardContent>
        </Card>

        {/* Packaging Models + Type */}
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Business Model
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Type:</span>
                <Badge className="px-2 py-0.5 text-xs bg-muted text-foreground">
                  {COMPETITOR_TYPE_LABELS[competitor.type]}
                </Badge>
              </div>
              {packagingModels.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Packaging:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {packagingModels.map((model) => (
                      <Badge
                        key={model}
                        className="px-2 py-0.5 text-xs bg-muted text-foreground"
                      >
                        {PACKAGING_MODEL_LABELS[model]}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {competitor.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  <a
                    href={competitor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    {competitor.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
