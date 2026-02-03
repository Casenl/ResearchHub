import {
  FileText,
  AlertTriangle,
  Clock,
  Library,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { MOCK_RESEARCH } from "@/data/mock-research";

// ---------------------------------------------------------------------------
// Derived statistics
// ---------------------------------------------------------------------------

const publishedCount = MOCK_RESEARCH.filter(
  (r) => r.status === "published"
).length;

const expiringSoonCount = MOCK_RESEARCH.filter(
  (r) =>
    r.expires_at &&
    new Date(r.expires_at) > new Date() &&
    new Date(r.expires_at) <
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
).length;

const inReviewCount = MOCK_RESEARCH.filter(
  (r) => r.status === "review"
).length;

const contextDocCount = MOCK_RESEARCH.reduce(
  (acc, r) => acc + r.context_documents.length,
  0
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DashboardStats(): React.JSX.Element {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardDescription className="text-sm font-medium">
            Published Research
          </CardDescription>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{publishedCount}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Total published and available
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardDescription className="text-sm font-medium">
            Expiring Soon
          </CardDescription>
          <AlertTriangle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{expiringSoonCount}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Within next 90 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardDescription className="text-sm font-medium">
            In Review
          </CardDescription>
          <Clock className="h-4 w-4 text-info" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{inReviewCount}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Awaiting reviewer approval
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardDescription className="text-sm font-medium">
            Context Documents
          </CardDescription>
          <Library className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{contextDocCount}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Linked across all research
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
