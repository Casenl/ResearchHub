import React from "react";
import { Calendar } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ValidityPeriodSectionProps {
  validFrom: string;
  onValidFromChange: (value: string) => void;
  validUntil: string;
  onValidUntilChange: (value: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ValidityPeriodSection({
  validFrom,
  onValidFromChange,
  validUntil,
  onValidUntilChange,
}: ValidityPeriodSectionProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Validity Period
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="valid-from"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Valid from
            </label>
            <Input
              id="valid-from"
              type="date"
              value={validFrom}
              onChange={(e) => onValidFromChange(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="valid-until"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Valid until
            </label>
            <Input
              id="valid-until"
              type="date"
              value={validUntil}
              onChange={(e) => onValidUntilChange(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
