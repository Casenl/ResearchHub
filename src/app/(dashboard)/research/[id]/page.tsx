"use client";

import { use } from "react";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import {
  ArrowLeft,
  Edit,
  FileDown,
  RefreshCw,
  Copy,
  BookOpen,
  FileText,
  Link as LinkIcon,
  History,
  AlertCircle,
  ExternalLink,
  Calendar,
  User,
  Clock,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { DimensionTags } from "@/components/shared/dimension-tags";
import {
  MOCK_RESEARCH,
  MOCK_AUTHORS,
  getResearchById,
} from "@/data/mock-research";
import { formatDate, getRelativeTime, getQualityTierLabel } from "@/lib/utils";
import type { NotebookType, ResearchTool } from "@/types";

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

const NOTEBOOK_TYPE_DISPLAY: Record<string, string> = {
  market_regulation: "Market & Regulation",
  competitive: "Competitive Analysis",
  business_model: "Business Model",
  local_sector: "Local Sector",
};

const RESEARCH_TOOL_DISPLAY: Record<string, string> = {
  notebooklm: "NotebookLM",
  claude: "Claude",
  perplexity: "Perplexity",
  manual: "Manual",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ResearchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const research = getResearchById(id);

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
    ? getResearchById(research.previous_version_id)
    : null;

  const clonedFrom = research.cloned_from_id
    ? getResearchById(research.cloned_from_id)
    : null;

  const allVersions = research.version_ids
    .map((vid) => getResearchById(vid))
    .filter(Boolean);

  return (
    <div className="space-y-6">
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
              {MOCK_AUTHORS[research.author_id] ?? "Unknown"}
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

        {/* Overview Tab */}
        <Tabs.Content value="overview" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {research.description}
              </p>
            </CardContent>
          </Card>

          {research.synthesis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Synthesis</CardTitle>
                <CardDescription>
                  Combined analysis across all notebooks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-sm leading-relaxed">
                  {research.synthesis.split("\n").map((line, i) => {
                    if (line.startsWith("## ")) {
                      return (
                        <h2
                          key={i}
                          className="mb-2 mt-4 text-lg font-semibold first:mt-0"
                        >
                          {line.replace("## ", "")}
                        </h2>
                      );
                    }
                    if (line.startsWith("### ")) {
                      return (
                        <h3
                          key={i}
                          className="mb-1.5 mt-3 text-sm font-semibold"
                        >
                          {line.replace("### ", "")}
                        </h3>
                      );
                    }
                    if (line.startsWith("- ")) {
                      return (
                        <li
                          key={i}
                          className="ml-4 text-sm text-muted-foreground"
                        >
                          {line.replace("- ", "")}
                        </li>
                      );
                    }
                    if (line.trim() === "") {
                      return <div key={i} className="h-2" />;
                    }
                    return (
                      <p
                        key={i}
                        className="text-sm text-muted-foreground"
                      >
                        {line}
                      </p>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {research.change_log && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Change Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-sm leading-relaxed text-muted-foreground">
                  {research.change_log.split("\n").map((line, i) => (
                    <p key={i}>{line || "\u00A0"}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </Tabs.Content>

        {/* Notebooks Tab */}
        <Tabs.Content value="notebooks" className="mt-6 space-y-4">
          {research.notebooks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No notebooks have been created yet
                </p>
              </CardContent>
            </Card>
          ) : (
            research.notebooks.map((notebook) => (
              <Card key={notebook.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {NOTEBOOK_TYPE_DISPLAY[notebook.type] ?? notebook.type}
                    </CardTitle>
                    <Badge variant="secondary">
                      {RESEARCH_TOOL_DISPLAY[notebook.research_tool] ??
                        notebook.research_tool}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Discovery Prompt
                    </p>
                    <p className="mt-1 rounded-md bg-muted/50 p-3 text-sm italic text-muted-foreground">
                      {notebook.discovery_prompt}
                    </p>
                  </div>

                  {notebook.analysis_prompts.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Analysis Prompts
                      </p>
                      <ul className="mt-1 space-y-1">
                        {notebook.analysis_prompts.map((prompt, idx) => (
                          <li
                            key={idx}
                            className="rounded-md bg-muted/50 p-2 text-sm text-muted-foreground"
                          >
                            {prompt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {notebook.sources.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Sources ({notebook.sources.length})
                      </p>
                      <div className="mt-1 space-y-1">
                        {notebook.sources.map((source) => (
                          <div
                            key={source.id}
                            className="flex items-center justify-between rounded-md border border-border p-2"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {source.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {source.publisher} &middot;{" "}
                                {formatDate(source.publication_date)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="shrink-0 text-[10px]"
                              >
                                Tier {source.quality_tier}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {notebook.findings && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Findings
                      </p>
                      <div className="mt-1 rounded-md border border-border p-4">
                        {notebook.findings.split("\n").map((line, i) => {
                          if (line.startsWith("## ")) {
                            return (
                              <h3
                                key={i}
                                className="mb-2 mt-3 text-sm font-semibold first:mt-0"
                              >
                                {line.replace("## ", "")}
                              </h3>
                            );
                          }
                          if (line.startsWith("### ")) {
                            return (
                              <h4
                                key={i}
                                className="mb-1 mt-2 text-sm font-medium"
                              >
                                {line.replace("### ", "")}
                              </h4>
                            );
                          }
                          if (line.startsWith("- ")) {
                            return (
                              <li
                                key={i}
                                className="ml-4 text-sm text-muted-foreground"
                              >
                                {line.replace("- ", "")}
                              </li>
                            );
                          }
                          if (line.trim() === "") {
                            return <div key={i} className="h-1.5" />;
                          }
                          return (
                            <p
                              key={i}
                              className="text-sm text-muted-foreground"
                            >
                              {line}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </Tabs.Content>

        {/* Sources Tab */}
        <Tabs.Content value="sources" className="mt-6">
          {(() => {
            const allSources = research.notebooks.flatMap((nb) => nb.sources);
            if (allSources.length === 0) {
              return (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <LinkIcon className="h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      No sources have been recorded yet
                    </p>
                  </CardContent>
                </Card>
              );
            }
            return (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Title
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Publisher
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Quality
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Discovered By
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Link
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {allSources.map((source) => (
                          <tr key={source.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <p className="font-medium">{source.title}</p>
                              {source.notes && (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {source.notes}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {source.publisher}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                              {formatDate(source.publication_date)}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={
                                  source.quality_tier <= 2
                                    ? "success"
                                    : source.quality_tier <= 4
                                    ? "info"
                                    : source.quality_tier <= 6
                                    ? "warning"
                                    : "secondary"
                                }
                                className="text-[10px]"
                              >
                                Tier {source.quality_tier}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="text-[10px]">
                                {RESEARCH_TOOL_DISPLAY[source.discovered_by] ??
                                  source.discovered_by}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </Tabs.Content>

        {/* Context Tab */}
        <Tabs.Content value="context" className="mt-6 space-y-3">
          {research.context_documents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No context documents linked
                </p>
              </CardContent>
            </Card>
          ) : (
            research.context_documents.map((doc) => (
              <Card key={doc.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{doc.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {doc.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="shrink-0 capitalize">
                      {doc.category.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      Format: <strong>{doc.file_type.toUpperCase()}</strong>
                    </span>
                    <span>Version {doc.version}</span>
                    <span>
                      Valid: {formatDate(doc.valid_from)} &ndash;{" "}
                      {formatDate(doc.valid_until)}
                    </span>
                    <span>Updated {formatDate(doc.updated_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </Tabs.Content>

        {/* Versions Tab */}
        <Tabs.Content value="versions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Version History</CardTitle>
              <CardDescription>
                All versions in this research lineage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allVersions.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No version history available
                </p>
              ) : (
                <div className="relative space-y-0">
                  {allVersions.map((version, idx) => {
                    if (!version) return null;
                    const isCurrent = version.id === research.id;
                    return (
                      <div key={version.id} className="flex gap-4">
                        {/* Timeline line */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`h-3 w-3 rounded-full border-2 ${
                              isCurrent
                                ? "border-primary bg-primary"
                                : "border-border bg-background"
                            }`}
                          />
                          {idx < allVersions.length - 1 && (
                            <div className="w-px flex-1 bg-border" />
                          )}
                        </div>
                        {/* Content */}
                        <div className="pb-6">
                          <div className="flex items-center gap-2">
                            {isCurrent ? (
                              <p className="text-sm font-semibold">
                                {version.title}
                              </p>
                            ) : (
                              <Link
                                href={`/research/${version.id}`}
                                className="text-sm font-semibold text-primary hover:underline"
                              >
                                {version.title}
                              </Link>
                            )}
                            <StatusBadge status={version.status} />
                            {isCurrent && (
                              <Badge variant="info" className="text-[10px]">
                                Current
                              </Badge>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {version.type === "refresh"
                              ? "Refresh"
                              : version.type === "clone"
                              ? "Clone"
                              : "Original"}{" "}
                            &middot; Created {formatDate(version.created_at)}
                            {version.published_at &&
                              ` \u00B7 Published ${formatDate(
                                version.published_at
                              )}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Assumptions Tab */}
        <Tabs.Content value="assumptions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Open Assumptions</CardTitle>
              <CardDescription>
                Assumptions that underpin this research and should be validated
                during refresh cycles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {research.assumptions.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No assumptions recorded
                </p>
              ) : (
                <ul className="space-y-2">
                  {research.assumptions.map((assumption, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <p className="text-sm text-amber-900">{assumption}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
