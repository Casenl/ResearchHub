"use client";

import { Users, Zap, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UsageView = "by-bu" | "by-tool" | "by-user";

interface UsageViewToggleProps {
  activeView: UsageView;
  onViewChange: (view: UsageView) => void;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const VIEW_OPTIONS: { value: UsageView; label: string; icon: React.ElementType }[] = [
  { value: "by-bu", label: "By BU", icon: Building2 },
  { value: "by-tool", label: "By AI Tool", icon: Zap },
  { value: "by-user", label: "By User", icon: Users },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UsageViewToggle({ activeView, onViewChange }: UsageViewToggleProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
      {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => {
        const isActive = activeView === value;
        return (
          <Button
            key={value}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange(value)}
            className={cn(
              "gap-1.5 transition-all",
              !isActive && "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Button>
        );
      })}
    </div>
  );
}
