import { FileText } from "lucide-react";

import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Notebook } from "@/types";

// ---------------------------------------------------------------------------
// Display maps
// ---------------------------------------------------------------------------

const NOTEBOOK_TYPE_DISPLAY: Record<string, string> = {
  market_regulation: "Market & Regulation",
  competitive: "Competitive Analysis",
  business_model: "Business Model",
  local_sector: "Local Sector",
};

const RESEARCH_TOOL_DISPLAY: Record<string, string> = {
  notebooklm: "NotebookLM",
  claude: "Claude",
  perplexity: "Perplexity",
  manual: "Manual",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface NotebooksTabProps {
  notebooks: Notebook[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NotebooksTab({
  notebooks,
}: NotebooksTabProps): React.JSX.Element {
  const hasNotebooks = notebooks.length > 0;

  if (!hasNotebooks) {
    return (
      <div className="mt-6 space-y-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              No notebooks have been created yet
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {notebooks.map((notebook) => (
        <Card key={notebook.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {NOTEBOOK_TYPE_DISPLAY[notebook.type] ?? notebook.type}
              </CardTitle>
              <Badge variant="secondary">
                {RESEARCH_TOOL_DISPLAY[notebook.research_tool] ??
                  notebook.research_tool}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Discovery Prompt
              </p>
              <p className="mt-1 rounded-md bg-muted/50 p-3 text-sm italic text-muted-foreground">
                {notebook.discovery_prompt}
              </p>
            </div>

            {notebook.analysis_prompts.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Analysis Prompts
                </p>
                <ul className="mt-1 space-y-1">
                  {notebook.analysis_prompts.map((prompt, idx) => (
                    <li
                      key={idx}
                      className="rounded-md bg-muted/50 p-2 text-sm text-muted-foreground"
                    >
                      {prompt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {notebook.sources.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Sources ({notebook.sources.length})
                </p>
                <div className="mt-1 space-y-1">
                  {notebook.sources.map((source) => (
                    <div
                      key={source.id}
                      className="flex items-center justify-between rounded-md border border-border p-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {source.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {source.publisher} &middot;{" "}
                          {formatDate(source.publication_date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="shrink-0 text-[10px]"
                        >
                          Tier {source.quality_tier}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {notebook.findings && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Findings
                </p>
                <div className="mt-1 rounded-md border border-border p-4">
                  {notebook.findings.split("\n").map((line, i) => {
                    if (line.startsWith("## ")) {
                      return (
                        <h3
                          key={i}
                          className="mb-2 mt-3 text-sm font-semibold first:mt-0"
                        >
                          {line.replace("## ", "")}
                        </h3>
                      );
                    }
                    if (line.startsWith("### ")) {
                      return (
                        <h4
                          key={i}
                          className="mb-1 mt-2 text-sm font-medium"
                        >
                          {line.replace("### ", "")}
                        </h4>
                      );
                    }
                    if (line.startsWith("- ")) {
                      return (
                        <li
                          key={i}
                          className="ml-4 text-sm text-muted-foreground"
                        >
                          {line.replace("- ", "")}
                        </li>
                      );
                    }
                    if (line.trim() === "") {
                      return <div key={i} className="h-1.5" />;
                    }
                    return (
                      <p
                        key={i}
                        className="text-sm text-muted-foreground"
                      >
                        {line}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
