import React from "react";
import {
  Calendar,
  User,
  FileText,
  Tag,
  AlertTriangle,
} from "lucide-react";

import { cn, formatDate, getRelativeTime, isExpired, isExpiringSoon } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { ContextDocument } from "@/types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DocumentSidebarProps {
  document: ContextDocument;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DocumentSidebar({
  document,
}: DocumentSidebarProps): React.JSX.Element {
  const isDocExpired = isExpired(document.valid_until);
  const isDocExpiringSoon =
    !isDocExpired && isExpiringSoon(document.valid_until);

  return (
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
              {isDocExpired ? (
                <Badge className="px-2 py-0.5 text-xs bg-red-100 text-red-700">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Expired
                </Badge>
              ) : isDocExpiringSoon ? (
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
                      isDocExpired
                        ? "text-red-600"
                        : isDocExpiringSoon
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
                <Badge
                  key={tagId}
                  variant="outline"
                  className="px-2 py-0.5 text-xs"
                >
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
  );
}
