"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Calendar,
  Copy,
  Edit,
  FileDown,
  FileText,
  RefreshCw,
  User,
} from "lucide-react";

import { formatDate, getRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DimensionTags } from "@/components/shared/dimension-tags";
import { StatusBadge } from "@/components/shared/status-badge";
import { useUsers } from "@/hooks/use-users";

import type { Research } from "@/types";

// ---------------------------------------------------------------------------
// Display maps
// ---------------------------------------------------------------------------

const OUTPUT_FORMAT_DISPLAY: Record<string, string> = {
  factsheet: "Factsheet",
  competitive: "Competitive Analysis",
  proposition: "Proposition Brief",
  full: "Full Report",
};

const REFRESH_SCHEDULE_DISPLAY: Record<string, string> = {
  quarterly: "Quarterly",
  semi_annually: "Semi-Annually",
  ad_hoc: "Ad Hoc",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ResearchHeaderProps {
  research: Research;
  previousVersion: Research | null;
  clonedFrom: Research | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ResearchHeader({
  research,
  previousVersion,
  clonedFrom,
}: ResearchHeaderProps): React.JSX.Element {
  const { data: users } = useUsers();

  return (
    <>
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/research">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Research Library
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {research.title}
            </h1>
            <StatusBadge status={research.status} />
          </div>
          {research.type !== "new" && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {research.type}
              </Badge>
              {research.type === "refresh" && previousVersion && (
                <span className="text-xs text-muted-foreground">
                  Refresh of{" "}
                  <Link
                    href={`/research/${previousVersion.id}`}
                    className="text-primary hover:underline"
                  >
                    {previousVersion.title}
                  </Link>
                </span>
              )}
              {research.type === "clone" && clonedFrom && (
                <span className="text-xs text-muted-foreground">
                  Cloned from{" "}
                  <Link
                    href={`/research/${clonedFrom.id}`}
                    className="text-primary hover:underline"
                  >
                    {clonedFrom.title}
                  </Link>
                  {research.cloned_changed_dimension && (
                    <> (changed: {research.cloned_changed_dimension})</>
                  )}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-1 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="mr-1 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-1 h-4 w-4" />
            Start Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Copy className="mr-1 h-4 w-4" />
            Clone
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <Card>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Author
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              {users.find((u) => u.id === research.author_id)?.name ?? "Unknown"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Output Format
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              {OUTPUT_FORMAT_DISPLAY[research.output_format] ??
                research.output_format}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Refresh Schedule
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
              {REFRESH_SCHEDULE_DISPLAY[research.refresh_schedule] ??
                research.refresh_schedule}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Next Refresh
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {research.next_refresh_date
                ? formatDate(research.next_refresh_date)
                : "Not scheduled"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Created
            </p>
            <p className="mt-1 text-sm">{formatDate(research.created_at)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Last Updated
            </p>
            <p className="mt-1 text-sm">
              {formatDate(research.updated_at)}{" "}
              <span className="text-muted-foreground">
                ({getRelativeTime(research.updated_at)})
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Published
            </p>
            <p className="mt-1 text-sm">
              {research.published_at
                ? formatDate(research.published_at)
                : "Not yet published"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Expires
            </p>
            <p className="mt-1 text-sm">
              {research.expires_at
                ? formatDate(research.expires_at)
                : "No expiration set"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dimension tags */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Dimensions
        </p>
        <DimensionTags dimensions={research.dimensions} />
      </div>

      {/* Tags */}
      {research.tags.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {research.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
