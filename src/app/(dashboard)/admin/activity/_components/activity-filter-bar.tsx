"use client";

import { Search, FileText, Users, Shield, Activity } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ACTIVITY_CATEGORY_LABELS } from "@/lib/constants";

import type { ActivityCategory } from "@/types";

// ---------------------------------------------------------------------------
// Category icon mapping
// ---------------------------------------------------------------------------

function getCategoryIcon(category: ActivityCategory): React.ElementType {
  switch (category) {
    case "research": return FileText;
    case "admin": return Shield;
    case "auth": return Users;
    case "system": return Activity;
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ActivityFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: ActivityCategory | "all";
  onCategoryChange: (category: ActivityCategory | "all") => void;
}

// ---------------------------------------------------------------------------
// Category options
// ---------------------------------------------------------------------------

const CATEGORY_OPTIONS: Array<{ value: ActivityCategory | "all"; label: string }> = [
  { value: "all", label: "All Categories" },
  ...Object.entries(ACTIVITY_CATEGORY_LABELS).map(([value, label]) => ({
    value: value as ActivityCategory,
    label,
  })),
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActivityFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: ActivityFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by actor or target name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category filter buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto">
        {CATEGORY_OPTIONS.map(({ value, label }) => {
          const isActive = selectedCategory === value;
          const Icon = value !== "all" ? getCategoryIcon(value) : Activity;

          return (
            <Button
              key={value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(value)}
              className={cn(
                "shrink-0 gap-1.5",
                isActive && "shadow-sm"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
