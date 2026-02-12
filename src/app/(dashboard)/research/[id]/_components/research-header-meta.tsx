"use client";

import {
  Calendar,
  FileText,
  RefreshCw,
  User,
} from "lucide-react";

import { formatDate, getRelativeTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
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
// Component
// ---------------------------------------------------------------------------

interface ResearchHeaderMetaProps {
  research: Research;
}

export function ResearchHeaderMeta({ research }: ResearchHeaderMetaProps): React.JSX.Element {
  const { data: users } = useUsers();

  return (
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
            {OUTPUT_FORMAT_DISPLAY[research.output_format] ?? research.output_format}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Refresh Schedule
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            {REFRESH_SCHEDULE_DISPLAY[research.refresh_schedule] ?? research.refresh_schedule}
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
  );
}
