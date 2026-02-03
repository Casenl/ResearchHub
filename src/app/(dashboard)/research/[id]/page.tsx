"use client";

import { use } from "react";
import Link from "next/link";

import * as Tabs from "@radix-ui/react-tabs";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  FileText,
  History,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useResearchById, useResearchList } from "@/hooks/use-research";

import { ResearchHeader } from "./_components/research-header";
import { OverviewTab } from "./_components/overview-tab";
import { NotebooksTab } from "./_components/notebooks-tab";
import { SourcesTab } from "./_components/sources-tab";
import { ContextTab } from "./_components/context-tab";
import { VersionsTab } from "./_components/versions-tab";
import { AssumptionsTab } from "./_components/assumptions-tab";

import type { Research } from "@/types";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ResearchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.JSX.Element {
  const { id } = use(params);
  const { data: research, isLoading } = useResearchById(id);
  const { data: allResearch } = useResearchList();

  if (isLoading && !research) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!research) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
        <h2 className="mt-4 text-lg font-semibold">Research Not Found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The research item with ID &ldquo;{id}&rdquo; could not be found.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link href="/research">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Research Library
          </Link>
        </Button>
      </div>
    );
  }

  const previousVersion = research.previous_version_id
    ? allResearch.find((r) => r.id === research.previous_version_id) ?? null
    : null;

  const clonedFrom = research.cloned_from_id
    ? allResearch.find((r) => r.id === research.cloned_from_id) ?? null
    : null;

  const allVersions = research.version_ids
    .map((vid) => allResearch.find((r) => r.id === vid))
    .filter((v): v is Research => v !== undefined);

  const allSources = research.notebooks.flatMap((nb) => nb.sources);

  return (
    <div className="space-y-6">
      <ResearchHeader
        research={research}
        previousVersion={previousVersion}
        clonedFrom={clonedFrom}
      />

      {/* Tabs */}
      <Tabs.Root defaultValue="overview">
        <Tabs.List className="flex border-b border-border">
          <Tabs.Trigger
            value="overview"
            className="inline-flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
          >
            <BookOpen className="h-4 w-4" />
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger
            value="notebooks"
            className="inline-flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
          >
            <FileText className="h-4 w-4" />
            Notebooks
            {research.notebooks.length > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1 text-[10px] font-semibold">
                {research.notebooks.length}
              </span>
            )}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="sources"
            className="inline-flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
          >
            <LinkIcon className="h-4 w-4" />
            Sources
          </Tabs.Trigger>
          <Tabs.Trigger
            value="context"
            className="inline-flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
          >
            <BookOpen className="h-4 w-4" />
            Context
            {research.context_documents.length > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1 text-[10px] font-semibold">
                {research.context_documents.length}
              </span>
            )}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="versions"
            className="inline-flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
          >
            <History className="h-4 w-4" />
            Versions
          </Tabs.Trigger>
          <Tabs.Trigger
            value="assumptions"
            className="inline-flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
          >
            <AlertCircle className="h-4 w-4" />
            Assumptions
            {research.assumptions.length > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1 text-[10px] font-semibold text-amber-700">
                {research.assumptions.length}
              </span>
            )}
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview">
          <OverviewTab research={research} />
        </Tabs.Content>
        <Tabs.Content value="notebooks">
          <NotebooksTab notebooks={research.notebooks} />
        </Tabs.Content>
        <Tabs.Content value="sources">
          <SourcesTab sources={allSources} />
        </Tabs.Content>
        <Tabs.Content value="context">
          <ContextTab contextDocuments={research.context_documents} />
        </Tabs.Content>
        <Tabs.Content value="versions">
          <VersionsTab
            currentResearchId={research.id}
            allVersions={allVersions}
          />
        </Tabs.Content>
        <Tabs.Content value="assumptions">
          <AssumptionsTab assumptions={research.assumptions} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
