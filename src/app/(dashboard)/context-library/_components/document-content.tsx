import React from "react";
import { FileText, Download, Link as LinkIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { DOMAINS } from "@/data/domains";
import { MARKETS } from "@/data/markets";
import { SECTORS } from "@/data/sectors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { ContextDocument } from "@/types";

// ---------------------------------------------------------------------------
// Mock research references (placeholder)
// ---------------------------------------------------------------------------

const MOCK_RESEARCH_REFERENCES = [
  {
    id: "res-1",
    title: "NL Managed Security Services Market Factsheet 2025",
    status: "published" as const,
  },
  {
    id: "res-2",
    title: "BNL Competitive Landscape: MDR Providers",
    status: "in_progress" as const,
  },
  {
    id: "res-3",
    title: "DACH Cloud Infrastructure Proposition Brief",
    status: "draft" as const,
  },
];

const STATUS_BADGE_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  in_progress: "bg-amber-100 text-amber-700",
  review: "bg-blue-100 text-blue-700",
  published: "bg-green-100 text-green-700",
  archived: "bg-slate-100 text-slate-500",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveDimensionNames(
  domainIds: string[],
  marketIds: string[],
  sectorIds: string[]
): {
  domainNames: string[];
  marketNames: string[];
  sectorNames: string[];
} {
  const domainNames = domainIds.map((id) => {
    const domain = DOMAINS.find((d) => d.id === id);
    return domain?.name ?? id;
  });
  const marketNames = marketIds.map((id) => {
    const market = MARKETS.find((m) => m.id === id);
    return market?.name ?? id;
  });
  const sectorNames = sectorIds.map((id) => {
    const sector = SECTORS.find((s) => s.id === id);
    return sector?.name ?? id;
  });
  return { domainNames, marketNames, sectorNames };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DocumentContentProps {
  document: ContextDocument;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DocumentContent({
  document,
}: DocumentContentProps): React.JSX.Element {
  const { domainNames, marketNames, sectorNames } = resolveDimensionNames(
    document.domain_ids,
    document.market_ids,
    document.sector_ids
  );

  return (
    <div className="space-y-6 lg:col-span-2">
      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {document.description}
          </p>
        </CardContent>
      </Card>

      {/* Dimensions */}
      <Card>
        <CardHeader>
          <CardTitle>Dimensions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <DimensionGroup
              label="Domains"
              names={domainNames}
              colorClass="bg-purple-100 text-purple-800"
            />
            <DimensionGroup
              label="Markets"
              names={marketNames}
              colorClass="bg-blue-100 text-blue-800"
            />
            <DimensionGroup
              label="Sectors"
              names={sectorNames}
              colorClass="bg-emerald-100 text-emerald-800"
            />
          </div>
        </CardContent>
      </Card>

      {/* Used in Research */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
            Used in Research
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_RESEARCH_REFERENCES.map((ref) => (
              <div
                key={ref.id}
                className="flex items-center justify-between rounded-md border border-border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {ref.title}
                  </span>
                </div>
                <Badge
                  className={cn(
                    "px-2 py-0.5 text-xs",
                    STATUS_BADGE_COLORS[ref.status]
                  )}
                >
                  {ref.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Preview */}
      <Card>
        <CardHeader>
          <CardTitle>File Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-12">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="mb-1 text-sm font-medium text-muted-foreground">
              Preview not available
            </p>
            <p className="text-xs text-muted-foreground">
              Download the file to view its contents
            </p>
            <Button variant="outline" size="sm" className="mt-4">
              <Download className="mr-1.5 h-4 w-4" />
              Download {document.file_type.toUpperCase()}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Dimension group (domains / markets / sectors)
// ---------------------------------------------------------------------------

interface DimensionGroupProps {
  label: string;
  names: string[];
  colorClass: string;
}

function DimensionGroup({
  label,
  names,
  colorClass,
}: DimensionGroupProps): React.JSX.Element {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {names.length > 0 ? (
          names.map((name) => (
            <Badge key={name} className={cn("px-2 py-0.5 text-xs", colorClass)}>
              {name}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">
            All {label.toLowerCase()}
          </span>
        )}
      </div>
    </div>
  );
}
