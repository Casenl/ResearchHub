import type { ContextDocumentCategory } from "@/types";

// ---------------------------------------------------------------------------
// Shared category badge color configuration
// Used by the listing page (document cards) and the detail page (header).
// ---------------------------------------------------------------------------

export const CATEGORY_COLORS: Record<ContextDocumentCategory, string> = {
  service_description: "bg-blue-100 text-blue-800",
  strategy: "bg-purple-100 text-purple-800",
  process_model: "bg-indigo-100 text-indigo-800",
  external_source: "bg-emerald-100 text-emerald-800",
  regulatory: "bg-red-100 text-red-800",
  previous_research: "bg-amber-100 text-amber-800",
};
