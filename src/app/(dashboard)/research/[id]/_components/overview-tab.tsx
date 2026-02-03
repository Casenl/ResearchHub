import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { Research } from "@/types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface OverviewTabProps {
  research: Research;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OverviewTab({ research }: OverviewTabProps): React.JSX.Element {
  return (
    <div className="mt-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {research.description}
          </p>
        </CardContent>
      </Card>

      {research.synthesis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Synthesis</CardTitle>
            <CardDescription>
              Combined analysis across all notebooks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-sm leading-relaxed">
              {research.synthesis.split("\n").map((line, i) => {
                if (line.startsWith("## ")) {
                  return (
                    <h2
                      key={i}
                      className="mb-2 mt-4 text-lg font-semibold first:mt-0"
                    >
                      {line.replace("## ", "")}
                    </h2>
                  );
                }
                if (line.startsWith("### ")) {
                  return (
                    <h3
                      key={i}
                      className="mb-1.5 mt-3 text-sm font-semibold"
                    >
                      {line.replace("### ", "")}
                    </h3>
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
                  return <div key={i} className="h-2" />;
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
          </CardContent>
        </Card>
      )}

      {research.change_log && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-sm leading-relaxed text-muted-foreground">
              {research.change_log.split("\n").map((line, i) => (
                <p key={i}>{line || "\u00A0"}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
