import Link from "next/link";

import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";

import type { Research } from "@/types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface VersionsTabProps {
  currentResearchId: string;
  allVersions: Research[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VersionsTab({
  currentResearchId,
  allVersions,
}: VersionsTabProps): React.JSX.Element {
  const hasVersions = allVersions.length > 0;

  return (
    <div className="mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Version History</CardTitle>
          <CardDescription>
            All versions in this research lineage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasVersions ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No version history available
            </p>
          ) : (
            <div className="relative space-y-0">
              {allVersions.map((version, idx) => {
                const isCurrent = version.id === currentResearchId;
                return (
                  <div key={version.id} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-3 w-3 rounded-full border-2 ${
                          isCurrent
                            ? "border-primary bg-primary"
                            : "border-border bg-background"
                        }`}
                      />
                      {idx < allVersions.length - 1 && (
                        <div className="w-px flex-1 bg-border" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pb-6">
                      <div className="flex items-center gap-2">
                        {isCurrent ? (
                          <p className="text-sm font-semibold">
                            {version.title}
                          </p>
                        ) : (
                          <Link
                            href={`/research/${version.id}`}
                            className="text-sm font-semibold text-primary hover:underline"
                          >
                            {version.title}
                          </Link>
                        )}
                        <StatusBadge status={version.status} />
                        {isCurrent && (
                          <Badge variant="info" className="text-[10px]">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {version.type === "refresh"
                          ? "Refresh"
                          : version.type === "clone"
                          ? "Clone"
                          : "Original"}{" "}
                        &middot; Created {formatDate(version.created_at)}
                        {version.published_at &&
                          ` \u00B7 Published ${formatDate(
                            version.published_at
                          )}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
