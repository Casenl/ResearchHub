"use client";

import Link from "next/link";
import { Calendar, User, FileText } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { DimensionTags } from "@/components/shared/dimension-tags";
import { useUsers } from "@/hooks/use-users";
import { formatDate } from "@/lib/utils";

import { OUTPUT_FORMAT_DISPLAY } from "./constants";

import type { Research } from "@/types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ResearchCardProps {
  research: Research;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ResearchCard({ research }: ResearchCardProps): React.JSX.Element {
  const { data: users } = useUsers();

  return (
    <Link href={`/research/${research.id}`} className="group block">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-base group-hover:text-primary">
              {research.title}
            </CardTitle>
            <StatusBadge status={research.status} />
          </div>
          <CardDescription className="line-clamp-2">
            {research.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <DimensionTags dimensions={research.dimensions} compact />

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {OUTPUT_FORMAT_DISPLAY[research.output_format] ??
                  research.output_format}
              </span>
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" />
                {users.find((u) => u.id === research.author_id)?.name ?? "Unknown"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(research.updated_at)}
              </span>
              {research.type !== "new" && (
                <Badge variant="outline" className="text-[10px] capitalize">
                  {research.type}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
