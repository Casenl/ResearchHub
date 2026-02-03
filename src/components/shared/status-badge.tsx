import * as React from "react";
import { cn } from "@/lib/utils";
import type { ResearchStatus } from "@/types";

const STATUS_CONFIG: Record<
  ResearchStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  review: {
    label: "In Review",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  published: {
    label: "Published",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  archived: {
    label: "Archived",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

interface StatusBadgeProps {
  status: ResearchStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
