"use client";

import React from "react";
import { Edit, Download, Trash2, AlertTriangle } from "lucide-react";

import { cn, isExpired, isExpiringSoon } from "@/lib/utils";
import { CONTEXT_CATEGORY_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { CATEGORY_COLORS } from "./category-colors";

import type { ContextDocument } from "@/types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DocumentHeaderProps {
  document: ContextDocument;
  onDelete: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DocumentHeader({
  document,
  onDelete,
}: DocumentHeaderProps): React.JSX.Element {
  const isDocExpired = isExpired(document.valid_until);
  const isDocExpiringSoon = !isDocExpired && isExpiringSoon(document.valid_until);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              "px-2 py-0.5 text-xs",
              CATEGORY_COLORS[document.category]
            )}
          >
            {CONTEXT_CATEGORY_LABELS[document.category]}
          </Badge>
          {isDocExpired && (
            <Badge className="px-2 py-0.5 text-xs bg-red-100 text-red-700">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Expired
            </Badge>
          )}
          {isDocExpiringSoon && (
            <Badge className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Expiring soon
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground">{document.title}</h1>
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
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="mr-1.5 h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
