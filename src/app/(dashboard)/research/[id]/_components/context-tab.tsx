import { BookOpen } from "lucide-react";

import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { ContextDocument } from "@/types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ContextTabProps {
  contextDocuments: ContextDocument[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ContextTab({
  contextDocuments,
}: ContextTabProps): React.JSX.Element {
  const hasDocuments = contextDocuments.length > 0;

  if (!hasDocuments) {
    return (
      <div className="mt-6 space-y-3">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              No context documents linked
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {contextDocuments.map((doc) => (
        <Card key={doc.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">{doc.title}</CardTitle>
                <CardDescription className="mt-1">
                  {doc.description}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="shrink-0 capitalize">
                {doc.category.replace(/_/g, " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                Format: <strong>{doc.file_type.toUpperCase()}</strong>
              </span>
              <span>Version {doc.version}</span>
              <span>
                Valid: {formatDate(doc.valid_from)} &ndash;{" "}
                {formatDate(doc.valid_until)}
              </span>
              <span>Updated {formatDate(doc.updated_at)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
