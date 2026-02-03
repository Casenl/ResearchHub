"use client";

import { Activity } from "lucide-react";

import { Card, CardHeader, CardDescription, CardContent } from "@/components/ui/card";

import { ActivityEntry } from "./activity-entry";

import type { ActivityLogEntry } from "@/types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ActivityFeedProps {
  entries: ActivityLogEntry[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActivityFeed({ entries }: ActivityFeedProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No activity found
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Event Feed</h2>
          </div>
          <CardDescription>
            {entries.length} {entries.length === 1 ? "event" : "events"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y-0">
          {entries.map((entry) => (
            <ActivityEntry key={entry.id} entry={entry} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
