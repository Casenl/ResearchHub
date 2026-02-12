import * as React from "react";

import { User, Bot, Users } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ResearchOrigin } from "@/types";

const ORIGIN_CONFIG: Record<
  ResearchOrigin,
  { label: string; className: string; icon: React.ElementType }
> = {
  human: {
    label: "Human",
    className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700",
    icon: User,
  },
  agent: {
    label: "Agent",
    className: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800",
    icon: Bot,
  },
  hybrid: {
    label: "Hybrid",
    className: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-800",
    icon: Users,
  },
};

interface ProvenanceBadgeProps {
  origin: ResearchOrigin;
  className?: string;
}

export function ProvenanceBadge({ origin, className }: ProvenanceBadgeProps): React.JSX.Element {
  const config = ORIGIN_CONFIG[origin] ?? {
    label: origin,
    className: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    icon: User,
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}
