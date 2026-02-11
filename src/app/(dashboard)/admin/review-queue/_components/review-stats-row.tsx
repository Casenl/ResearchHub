import { Check, X, FileText } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

// =============================================================================
// ReviewStatsRow
// =============================================================================

interface ReviewStatsRowProps {
  totalPending: number;
  approvedToday: number;
  rejectedToday: number;
}

export function ReviewStatsRow({
  totalPending,
  approvedToday,
  rejectedToday,
}: ReviewStatsRowProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <FileText className="size-5 text-amber-500" />
          <div>
            <p className="text-2xl font-bold">{totalPending}</p>
            <p className="text-xs text-muted-foreground">Pending review</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Check className="size-5 text-green-500" />
          <div>
            <p className="text-2xl font-bold">{approvedToday}</p>
            <p className="text-xs text-muted-foreground">Approved today</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <X className="size-5 text-red-500" />
          <div>
            <p className="text-2xl font-bold">{rejectedToday}</p>
            <p className="text-xs text-muted-foreground">Rejected today</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
