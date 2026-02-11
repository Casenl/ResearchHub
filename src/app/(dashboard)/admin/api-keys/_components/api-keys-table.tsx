"use client";

import React from "react";

import { Ban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

import type { ApiKey } from "@/types";

// =============================================================================
// Types
// =============================================================================

interface ApiKeysTableProps {
  keys: ApiKey[];
  onRevoke: (id: string) => void;
}

// =============================================================================
// Helpers
// =============================================================================

const PERMISSION_LABELS: Record<string, string> = {
  read: "Read",
  read_write: "Read & Write",
  admin: "Admin",
};

function StatusPill({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
      Revoked
    </span>
  );
}

// =============================================================================
// Component
// =============================================================================

export function ApiKeysTable({ keys, onRevoke }: ApiKeysTableProps) {
  if (keys.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No API keys have been created yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Permissions</th>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Last Used</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium sr-only">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {keys.map((k) => (
              <tr key={k.id} className="hover:bg-muted/20">
                <td className="whitespace-nowrap px-4 py-3 font-medium">
                  {k.name}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {PERMISSION_LABELS[k.permissions] ?? k.permissions}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {k.agent_identity.agent_name || "--"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {k.created_at ? formatDate(k.created_at) : "--"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {k.last_used_at ? formatDate(k.last_used_at) : "Never"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {k.expires_at ? formatDate(k.expires_at) : "Never"}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusPill isActive={k.is_active} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {k.is_active && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onRevoke(k.id)}
                    >
                      <Ban className="h-3.5 w-3.5" />
                      Revoke
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
