"use client";

import React from "react";
import { Users, Edit, Shield } from "lucide-react";

import type { User } from "@/types";

// =============================================================================
// User Stats Summary Grid
// =============================================================================

interface UserStatsGridProps {
  users: User[];
}

export function UserStatsGrid({ users }: UserStatsGridProps): React.JSX.Element {
  const adminCount = users.filter((u) => u.role === "admin").length;
  const researcherCount = users.filter((u) => u.role === "researcher").length;
  const viewerCount = users.filter((u) => u.role === "viewer").length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
      <div className="rounded-lg border border-border bg-background p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          Total Users
        </div>
        <p className="mt-1 text-2xl font-bold">{users.length}</p>
      </div>
      <div className="rounded-lg border border-border bg-background p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-red-500" />
          Admins
        </div>
        <p className="mt-1 text-2xl font-bold">{adminCount}</p>
      </div>
      <div className="rounded-lg border border-border bg-background p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Edit className="h-4 w-4 text-blue-500" />
          Researchers
        </div>
        <p className="mt-1 text-2xl font-bold">{researcherCount}</p>
      </div>
      <div className="rounded-lg border border-border bg-background p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4 text-muted-foreground" />
          Viewers
        </div>
        <p className="mt-1 text-2xl font-bold">{viewerCount}</p>
      </div>
    </div>
  );
}
