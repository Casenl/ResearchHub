"use client";

import { useState, useMemo } from "react";

import { useActivityLog } from "@/hooks/use-activity";

import { HealthMetricsBar } from "./_components/health-metrics-bar";
import { ActivityFilterBar } from "./_components/activity-filter-bar";
import { ActivityFeed } from "./_components/activity-feed";

import type { ActivityCategory } from "@/types";

// =============================================================================
// Activity Log Page
// =============================================================================

export default function ActivityPage(): React.JSX.Element {
  const { data: activityLog } = useActivityLog();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ActivityCategory | "all"
  >("all");

  // ---------------------------------------------------------------------------
  // Filtered entries
  // ---------------------------------------------------------------------------

  const filteredEntries = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return activityLog.filter((entry) => {
      // Category filter
      if (selectedCategory !== "all" && entry.category !== selectedCategory) {
        return false;
      }

      // Search filter — match actor name or target name
      if (query) {
        const matchesActor = entry.actor.display_name
          .toLowerCase()
          .includes(query);
        const matchesTarget = entry.target_name.toLowerCase().includes(query);
        if (!matchesActor && !matchesTarget) {
          return false;
        }
      }

      return true;
    });
  }, [activityLog, searchQuery, selectedCategory]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Audit trail of all system events across research, admin, and
          authentication
        </p>
      </div>

      {/* Health metrics summary */}
      <HealthMetricsBar activityEntries={activityLog} />

      {/* Filters */}
      <ActivityFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Activity feed */}
      <ActivityFeed entries={filteredEntries} />
    </div>
  );
}
