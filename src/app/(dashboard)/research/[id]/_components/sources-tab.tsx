import { ExternalLink, Link as LinkIcon } from "lucide-react";

import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import type { Source } from "@/types";

// ---------------------------------------------------------------------------
// Display maps
// ---------------------------------------------------------------------------

const RESEARCH_TOOL_DISPLAY: Record<string, string> = {
  notebooklm: "NotebookLM",
  claude: "Claude",
  perplexity: "Perplexity",
  manual: "Manual",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SourcesTabProps {
  sources: Source[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SourcesTab({ sources }: SourcesTabProps): React.JSX.Element {
  const hasSources = sources.length > 0;

  if (!hasSources) {
    return (
      <div className="mt-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LinkIcon className="h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              No sources have been recorded yet
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Publisher
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Quality
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Discovered By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Link
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sources.map((source) => (
                  <tr key={source.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{source.title}</p>
                      {source.notes && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {source.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {source.publisher}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(source.publication_date)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          source.quality_tier <= 2
                            ? "success"
                            : source.quality_tier <= 4
                            ? "info"
                            : source.quality_tier <= 6
                            ? "warning"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        Tier {source.quality_tier}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px]">
                        {RESEARCH_TOOL_DISPLAY[source.discovered_by] ??
                          source.discovered_by}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
