"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Download,
  Trash2,
  Calendar,
  User,
  Tag,
  FileText,
  Link as LinkIcon,
  AlertTriangle,
} from "lucide-react";

import { cn, formatDate, getRelativeTime, isExpired, isExpiringSoon } from "@/lib/utils";
import { CONTEXT_CATEGORY_LABELS } from "@/lib/constants";
import { MOCK_CONTEXT_DOCUMENTS } from "@/data/mock-context-documents";
import { DOMAINS } from "@/data/domains";
import { MARKETS } from "@/data/markets";
import { SECTORS } from "@/data/sectors";
import type { ContextDocumentCategory } from "@/types";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Category badge colors (same as listing page)
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<ContextDocumentCategory, string> = {
  service_description: "bg-blue-100 text-blue-800",
  strategy: "bg-purple-100 text-purple-800",
  process_model: "bg-indigo-100 text-indigo-800",
  external_source: "bg-emerald-100 text-emerald-800",
  regulatory: "bg-red-100 text-red-800",
  previous_research: "bg-amber-100 text-amber-800",
};

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
// Page Component
// ---------------------------------------------------------------------------

export default function ContextDocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const document = MOCK_CONTEXT_DOCUMENTS.find((doc) => doc.id === id);

  if (!document) {
    return (
      <div className="space-y-6">
        <Link
          href="/context-library"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Context Library
        </Link>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-1 text-lg font-semibold text-foreground">
            Document not found
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            The document with ID &quot;{id}&quot; could not be found.
          </p>
          <Link href="/context-library">
            <Button variant="outline">Return to library</Button>
          </Link>
        </div>
      </div>
    );
  }

  const expired = isExpired(document.valid_until);
  const expiringSoon = !expired && isExpiringSoon(document.valid_until);

  // Resolve dimension names
  const domainNames = document.domain_ids.map((domainId) => {
    const domain = DOMAINS.find((d) => d.id === domainId);
    return domain?.name ?? domainId;
  });
  const marketNames = document.market_ids.map((marketId) => {
    const market = MARKETS.find((m) => m.id === marketId);
    return market?.name ?? marketId;
  });
  const sectorNames = document.sector_ids.map((sectorId) => {
    const sector = SECTORS.find((s) => s.id === sectorId);
    return sector?.name ?? sectorId;
  });

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${document.title}"? This action cannot be undone.`
      )
    ) {
      alert("Document deleted (mock). Redirecting to library.");
      router.push("/context-library");
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/context-library"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Context Library
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className={cn("px-2 py-0.5 text-xs", CATEGORY_COLORS[document.category])}>
              {CONTEXT_CATEGORY_LABELS[document.category]}
            </Badge>
            {expired && (
              <Badge className="px-2 py-0.5 text-xs bg-red-100 text-red-700">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Expired
              </Badge>
            )}
            {expiringSoon && (
              <Badge className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Expiring soon
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {document.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-1.5 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 h-4 w-4" />
            Download
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content Column */}
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
                {/* Domains */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Domains
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {domainNames.length > 0 ? (
                      domainNames.map((name) => (
                        <Badge
                          key={name}
                          className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800"
                        >
                          {name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        All domains
                      </span>
                    )}
                  </div>
                </div>

                {/* Markets */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Markets
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {marketNames.length > 0 ? (
                      marketNames.map((name) => (
                        <Badge
                          key={name}
                          className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800"
                        >
                          {name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        All markets
                      </span>
                    )}
                  </div>
                </div>

                {/* Sectors */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sectors
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {sectorNames.length > 0 ? (
                      sectorNames.map((name) => (
                        <Badge
                          key={name}
                          className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800"
                        >
                          {name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        All sectors
                      </span>
                    )}
                  </div>
                </div>
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
                      className={cn("px-2 py-0.5 text-xs", STATUS_BADGE_COLORS[ref.status])}
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

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    Uploaded by
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {document.uploaded_by}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Last updated
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {formatDate(document.updated_at)}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({getRelativeTime(document.updated_at)})
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Version
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    v{document.version}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    File type
                  </dt>
                  <dd className="mt-1 text-sm uppercase text-foreground">
                    {document.file_type}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Validity */}
          <Card>
            <CardHeader>
              <CardTitle>Validity Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  {expired ? (
                    <Badge className="px-2 py-0.5 text-xs bg-red-100 text-red-700">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Expired
                    </Badge>
                  ) : expiringSoon ? (
                    <Badge className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Expiring soon
                    </Badge>
                  ) : (
                    <Badge className="px-2 py-0.5 text-xs bg-green-100 text-green-700">
                      Valid
                    </Badge>
                  )}
                </div>
                <div className="rounded-md bg-muted/50 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="font-medium text-foreground">
                        {formatDate(document.valid_from)}
                      </p>
                    </div>
                    <div className="mx-3 h-px w-6 bg-border" />
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Until</p>
                      <p
                        className={cn(
                          "font-medium",
                          expired
                            ? "text-red-600"
                            : expiringSoon
                              ? "text-amber-600"
                              : "text-foreground"
                        )}
                      >
                        {formatDate(document.valid_until)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              {document.tag_ids.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {document.tag_ids.map((tagId) => (
                    <Badge key={tagId} variant="outline" className="px-2 py-0.5 text-xs">
                      {tagId}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No tags assigned to this document.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
