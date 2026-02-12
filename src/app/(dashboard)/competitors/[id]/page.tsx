"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import * as Tabs from "@radix-ui/react-tabs";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Clock,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { COMPETITOR_TYPE_LABELS } from "@/lib/constants";
import {
  useCompetitorById,
  useDeleteCompetitor,
} from "@/hooks/use-competitors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { OverviewTab } from "./_components/overview-tab";
import { PositionsTab } from "./_components/positions-tab";
import { TimelineTab } from "./_components/timeline-tab";
import { RelatedResearchTab } from "./_components/related-research-tab";

// ---------------------------------------------------------------------------
// Type badge colors
// ---------------------------------------------------------------------------

const TYPE_COLORS: Record<string, string> = {
  msp: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200",
  vendor_partner:
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
  both: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-200",
};

// ---------------------------------------------------------------------------
// Tab trigger style
// ---------------------------------------------------------------------------

const tabTriggerClass =
  "inline-flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CompetitorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.JSX.Element {
  const { id } = use(params);
  const router = useRouter();
  const { data: competitor, isLoading } = useCompetitorById(id);
  const { deleteCompetitor, isDeleting } = useDeleteCompetitor();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async (): Promise<void> => {
    await deleteCompetitor(id);
    router.push("/competitors");
  };

  if (isLoading && !competitor) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!competitor) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
        <h2 className="mt-4 text-lg font-semibold">Competitor Not Found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The competitor with ID &ldquo;{id}&rdquo; could not be found.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link href="/competitors">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Competitors
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/competitors"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Competitors
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {competitor.name}
            </h1>
            <Badge
              className={cn(
                "px-2 py-0.5 text-xs",
                TYPE_COLORS[competitor.type]
              )}
            >
              {COMPETITOR_TYPE_LABELS[competitor.type]}
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            {competitor.website && (
              <a
                href={competitor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Globe className="h-3.5 w-3.5" />
                {competitor.website.replace(/^https?:\/\//, "")}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="overview">
        <Tabs.List className="flex border-b border-border">
          <Tabs.Trigger value="overview" className={tabTriggerClass}>
            <BookOpen className="h-4 w-4" />
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger value="positions" className={tabTriggerClass}>
            <MapPin className="h-4 w-4" />
            Positions
            {competitor.positions.length > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1 text-[10px] font-semibold">
                {competitor.positions.length}
              </span>
            )}
          </Tabs.Trigger>
          <Tabs.Trigger value="timeline" className={tabTriggerClass}>
            <Clock className="h-4 w-4" />
            Timeline
            {competitor.events.length > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1 text-[10px] font-semibold">
                {competitor.events.length}
              </span>
            )}
          </Tabs.Trigger>
          <Tabs.Trigger value="research" className={tabTriggerClass}>
            <BookOpen className="h-4 w-4" />
            Related Research
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview">
          <OverviewTab competitor={competitor} />
        </Tabs.Content>
        <Tabs.Content value="positions">
          <PositionsTab competitor={competitor} />
        </Tabs.Content>
        <Tabs.Content value="timeline">
          <TimelineTab competitor={competitor} />
        </Tabs.Content>
        <Tabs.Content value="research">
          <RelatedResearchTab competitor={competitor} />
        </Tabs.Content>
      </Tabs.Root>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Competitor"
        description={`Are you sure you want to delete "${competitor.name}"? This will remove all positions and timeline events. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}
