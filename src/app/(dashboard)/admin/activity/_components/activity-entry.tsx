"use client";

import { useState } from "react";
import { FileText, Users, Shield, Activity, Clock, ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn, getRelativeTime, formatDate } from "@/lib/utils";
import {
  ACTIVITY_ACTION_LABELS,
  ACTIVITY_TARGET_TYPE_LABELS,
} from "@/lib/constants";

import type { ActivityLogEntry, ActivityAction, ActivityTargetType } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getActionColor(action: ActivityAction): string {
  switch (action) {
    case "created": return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200";
    case "updated": return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200";
    case "deleted": return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200";
    case "published": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200";
    case "archived": return "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400";
    case "login": return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-200";
    case "role_changed": return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
}

function TargetIcon({ targetType, className }: { targetType: ActivityTargetType; className?: string }) {
  switch (targetType) {
    case "research":
    case "context_document":
    case "prompt_template":
      return <FileText className={className} />;
    case "ai_tool_profile":
      return <Activity className={className} />;
    case "user":
      return <Users className={className} />;
    case "taxonomy":
      return <Shield className={className} />;
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ActivityEntryProps {
  entry: ActivityLogEntry;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActivityEntry({ entry }: ActivityEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDetails = Object.keys(entry.details).length > 0;

  return (
    <div className="group border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
        className={cn(
          "flex w-full items-center gap-4 px-4 py-3 text-left transition-colors",
          hasDetails && "cursor-pointer hover:bg-muted/50",
          !hasDetails && "cursor-default"
        )}
      >
        {/* Timestamp */}
        <div className="flex w-28 shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span title={formatDate(entry.timestamp)}>
            {getRelativeTime(entry.timestamp)}
          </span>
        </div>

        {/* Actor */}
        <div className="flex w-36 shrink-0 items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
            {entry.actor.display_name.charAt(0).toUpperCase()}
          </div>
          <span className="truncate text-sm font-medium">
            {entry.actor.display_name}
          </span>
        </div>

        {/* Action badge */}
        <Badge
          className={cn(
            "w-20 justify-center border-0 text-[11px]",
            getActionColor(entry.action)
          )}
        >
          {ACTIVITY_ACTION_LABELS[entry.action]}
        </Badge>

        {/* Target */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <TargetIcon targetType={entry.target_type} className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">
            {ACTIVITY_TARGET_TYPE_LABELS[entry.target_type]}
          </span>
          <span className="truncate text-sm">{entry.target_name}</span>
        </div>

        {/* Expand indicator */}
        {hasDetails && (
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        )}
      </button>

      {/* Expanded details */}
      {isExpanded && hasDetails && (
        <div className="border-t border-dashed border-border bg-muted/30 px-4 py-3">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            {Object.entries(entry.details).map(([key, value]) => (
              <div key={key} className="contents">
                <dt className="text-xs font-medium text-muted-foreground capitalize">
                  {key.replace(/_/g, " ")}
                </dt>
                <dd className="text-xs text-foreground">
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
