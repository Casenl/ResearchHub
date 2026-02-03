import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// ---------------------------------------------------------------------------
// BackToLibraryLink – shared navigation link for detail & new pages
// ---------------------------------------------------------------------------

export function BackToLibraryLink(): React.JSX.Element {
  return (
    <Link
      href="/context-library"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Context Library
    </Link>
  );
}
