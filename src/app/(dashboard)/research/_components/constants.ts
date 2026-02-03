import type { ResearchStatus, OutputFormat } from "@/types";

// ---------------------------------------------------------------------------
// Status options for filter panel
// ---------------------------------------------------------------------------

export const ALL_STATUSES: { value: ResearchStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "In Review" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

// ---------------------------------------------------------------------------
// Output format display labels (card metadata)
// ---------------------------------------------------------------------------

export const OUTPUT_FORMAT_DISPLAY: Record<string, string> = {
  factsheet: "Factsheet",
  competitive: "Competitive Analysis",
  proposition: "Proposition Brief",
  full: "Full Report",
};

// ---------------------------------------------------------------------------
// Output format options for filter panel
// ---------------------------------------------------------------------------

export const ALL_OUTPUT_FORMATS: { value: OutputFormat; label: string }[] = [
  { value: "factsheet", label: "Factsheet" },
  { value: "competitive", label: "Competitive Analysis" },
  { value: "proposition", label: "Proposition Brief" },
  { value: "full", label: "Full Report" },
];

// ---------------------------------------------------------------------------
// Market IDs excluded from filter panel (top-level / region groupings)
// ---------------------------------------------------------------------------

export const EXCLUDED_MARKET_IDS = new Set([
  "market-glb",
  "market-dach",
  "market-de",
  "market-at",
  "market-ch",
  "market-fr",
  "market-uk",
]);
