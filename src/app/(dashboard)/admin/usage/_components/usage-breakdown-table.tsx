"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { CsvExportButton } from "./csv-export-button";
import { formatCurrency, formatNumber } from "./usage-formatters";
import { useUsageAggregation } from "./use-usage-aggregation";

import type { UsageView } from "./usage-view-toggle";

// ---------------------------------------------------------------------------
// View metadata
// ---------------------------------------------------------------------------

const VIEW_TITLES: Record<UsageView, string> = {
  "by-bu": "Breakdown by Business Unit",
  "by-tool": "Breakdown by AI Tool",
  "by-user": "Breakdown by User",
};

const CSV_FILENAMES: Record<UsageView, string> = {
  "by-bu": "usage-by-business-unit.csv",
  "by-tool": "usage-by-ai-tool.csv",
  "by-user": "usage-by-user.csv",
};

const COLUMN_LABELS: Record<UsageView, string> = {
  "by-bu": "Business Unit",
  "by-tool": "AI Tool",
  "by-user": "User",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface UsageBreakdownTableProps {
  view: UsageView;
}

export function UsageBreakdownTable({ view }: UsageBreakdownTableProps): React.JSX.Element {
  const rows = useUsageAggregation(view);

  const isUserView = view === "by-user";

  const csvHeaders = isUserView
    ? ["Name", "Business Unit", "Tokens", "Cost (EUR)", "API Calls"]
    : ["Name", "Tokens", "Cost (EUR)", "API Calls"];

  const csvRows = rows.map((r) =>
    isUserView
      ? [r.label, r.sublabel ?? "", r.tokens, r.cost.toFixed(2), r.calls]
      : [r.label, r.tokens, r.cost.toFixed(2), r.calls],
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h2 className="text-lg font-semibold">{VIEW_TITLES[view]}</h2>
        <CsvExportButton
          headers={csvHeaders}
          rows={csvRows}
          filename={CSV_FILENAMES[view]}
        />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 pr-4 font-semibold text-muted-foreground">
                  {COLUMN_LABELS[view]}
                </th>
                {isUserView && (
                  <th className="pb-3 pr-4 font-semibold text-muted-foreground">BU</th>
                )}
                <th className="pb-3 pr-4 text-right font-semibold text-muted-foreground">
                  Tokens
                </th>
                <th className="pb-3 pr-4 text-right font-semibold text-muted-foreground">
                  Cost
                </th>
                <th className="pb-3 text-right font-semibold text-muted-foreground">
                  API Calls
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.key}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 pr-4 font-medium">{row.label}</td>
                  {isUserView && (
                    <td className="py-3 pr-4">
                      <Badge variant="secondary">{row.sublabel}</Badge>
                    </td>
                  )}
                  <td className="py-3 pr-4 text-right tabular-nums">
                    {formatNumber(row.tokens)}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    {formatCurrency(row.cost)}
                  </td>
                  <td className="py-3 text-right tabular-nums">{row.calls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
