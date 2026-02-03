import type {
  ResearchStatus,
  OutputFormat,
  NotebookType,
  RefreshSchedule,
  ContextDocumentCategory,
} from "@/types";

// ---------------------------------------------------------------------------
// Research status labels
// ---------------------------------------------------------------------------

export const RESEARCH_STATUS_LABELS: Record<ResearchStatus, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  review: "In Review",
  published: "Published",
  archived: "Archived",
};

// ---------------------------------------------------------------------------
// Output format labels
// ---------------------------------------------------------------------------

export const OUTPUT_FORMAT_LABELS: Record<OutputFormat, string> = {
  factsheet: "Factsheet",
  competitive: "Competitive Analysis",
  proposition: "Proposition Brief",
  full: "Full Research Report",
};

// ---------------------------------------------------------------------------
// Notebook type labels
// ---------------------------------------------------------------------------

export const NOTEBOOK_TYPE_LABELS: Record<NotebookType, string> = {
  market_regulation: "Market & Regulation",
  competitive: "Competitive Landscape",
  business_model: "Business Model",
  local_sector: "Local Sector Deep-Dive",
};

// ---------------------------------------------------------------------------
// Refresh schedule labels
// ---------------------------------------------------------------------------

export const REFRESH_SCHEDULE_LABELS: Record<RefreshSchedule, string> = {
  quarterly: "Quarterly",
  semi_annually: "Semi-Annually",
  ad_hoc: "Ad Hoc",
};

// ---------------------------------------------------------------------------
// Quality tier labels (1 = highest quality, 8 = lowest)
// ---------------------------------------------------------------------------

export const QUALITY_TIER_LABELS: string[] = [
  "Tier 1 - Government / EU institutional reports",
  "Tier 2 - Independent annual reports & indices",
  "Tier 3 - Analyst houses (Gartner, Forrester, IDC)",
  "Tier 4 - Knowledge institutes & academia",
  "Tier 5 - Peer-reviewed industry research",
  "Tier 6 - Channel research & partner insights",
  "Tier 7 - Vendor research (white papers, technical reports)",
  "Tier 8 - Vendor marketing material",
];

// ---------------------------------------------------------------------------
// Context document category labels
// ---------------------------------------------------------------------------

export const CONTEXT_CATEGORY_LABELS: Record<ContextDocumentCategory, string> = {
  service_description: "Service Description",
  strategy: "Strategy Document",
  process_model: "Process Model",
  external_source: "External Source",
  regulatory: "Regulatory & Compliance",
  previous_research: "Previous Research",
};

// ---------------------------------------------------------------------------
// Notebook configurations per output format
// Maps each output format to the notebook types needed to produce it.
// ---------------------------------------------------------------------------

export const NOTEBOOK_CONFIGS: Record<OutputFormat, NotebookType[]> = {
  factsheet: ["market_regulation", "competitive"],
  competitive: ["market_regulation", "competitive", "business_model"],
  proposition: [
    "market_regulation",
    "competitive",
    "business_model",
    "local_sector",
  ],
  full: [
    "market_regulation",
    "competitive",
    "business_model",
    "local_sector",
  ],
};

// ---------------------------------------------------------------------------
// Refresh recommendations
// Maps output formats to recommended refresh cadences and triggers.
// ---------------------------------------------------------------------------

export interface RefreshRecommendation {
  schedule: RefreshSchedule;
  triggers: string[];
}

export const REFRESH_RECOMMENDATIONS: Record<OutputFormat, RefreshRecommendation> = {
  factsheet: {
    schedule: "semi_annually",
    triggers: [
      "Major regulatory change",
      "Significant market event",
      "New analyst report published",
    ],
  },
  competitive: {
    schedule: "quarterly",
    triggers: [
      "New market entrant",
      "M&A activity",
      "Competitor product launch",
      "Pricing change detected",
    ],
  },
  proposition: {
    schedule: "semi_annually",
    triggers: [
      "Service catalogue update",
      "New partnership announced",
      "Regulatory deadline approaching",
    ],
  },
  full: {
    schedule: "semi_annually",
    triggers: [
      "Technology paradigm shift",
      "Major vendor announcement",
      "Quarterly earnings cycle",
      "Regulatory deadline approaching",
    ],
  },
};

// ---------------------------------------------------------------------------
// Time estimates per output format
// Provides indicative effort metrics to help users plan research work.
// ---------------------------------------------------------------------------

export interface TimeEstimate {
  notebooks: number;
  prompts: number;
  estimatedHours: number;
}

export const TIME_ESTIMATES: Record<OutputFormat, TimeEstimate> = {
  factsheet: {
    notebooks: 2,
    prompts: 8,
    estimatedHours: 3,
  },
  competitive: {
    notebooks: 3,
    prompts: 14,
    estimatedHours: 6,
  },
  proposition: {
    notebooks: 4,
    prompts: 20,
    estimatedHours: 10,
  },
  full: {
    notebooks: 4,
    prompts: 30,
    estimatedHours: 16,
  },
};
