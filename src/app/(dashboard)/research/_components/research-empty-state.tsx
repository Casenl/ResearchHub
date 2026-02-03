"use client";

import { Library } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ResearchEmptyState(): React.JSX.Element {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Library className="h-10 w-10 text-muted-foreground/50" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          No research found
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Try adjusting your search or filters
        </p>
      </CardContent>
    </Card>
  );
}
