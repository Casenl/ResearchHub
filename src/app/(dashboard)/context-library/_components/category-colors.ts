import type { ContextDocumentCategory } from "@/types";

// ---------------------------------------------------------------------------
// Shared category badge color configuration
// Used by the listing page (document cards) and the detail page (header).
// ---------------------------------------------------------------------------

export const CATEGORY_COLORS: Record<ContextDocumentCategory, string> = {
  service_description: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  strategy: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
  process_model: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200",
  external_source: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  regulatory: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  previous_research: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
};
