import { AlertCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AssumptionsTabProps {
  assumptions: string[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AssumptionsTab({
  assumptions,
}: AssumptionsTabProps): React.JSX.Element {
  const hasAssumptions = assumptions.length > 0;

  return (
    <div className="mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Open Assumptions</CardTitle>
          <CardDescription>
            Assumptions that underpin this research and should be validated
            during refresh cycles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasAssumptions ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No assumptions recorded
            </p>
          ) : (
            <ul className="space-y-2">
              {assumptions.map((assumption, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <p className="text-sm text-amber-900">{assumption}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
