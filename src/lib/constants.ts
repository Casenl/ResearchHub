import type {
  ResearchStatus,
  OutputFormat,
  NotebookType,
  RefreshSchedule,
  ContextDocumentCategory,
  ResearchStep,
  AIToolStatus,
  FreshnessStatus,
  FreshnessAction,
  ActivityAction,
  ActivityCategory,
  ActivityTargetType,
  ValidationStatus,
  ReviewStatus,
  ResearchOrigin,
  ApiKeyPermission,
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

// ---------------------------------------------------------------------------
// Admin — Research step labels
// ---------------------------------------------------------------------------

export const RESEARCH_STEP_LABELS: Record<ResearchStep, string> = {
  discovery: "Discovery",
  analysis: "Analysis",
  synthesis: "Synthesis",
};

// ---------------------------------------------------------------------------
// Admin — AI tool status labels
// ---------------------------------------------------------------------------

export const AI_TOOL_STATUS_LABELS: Record<AIToolStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

// ---------------------------------------------------------------------------
// Admin — Freshness labels
// ---------------------------------------------------------------------------

export const FRESHNESS_STATUS_LABELS: Record<FreshnessStatus, string> = {
  fresh: "Fresh",
  stale: "Stale",
  archived: "Archived",
};

export const FRESHNESS_ACTION_LABELS: Record<FreshnessAction, string> = {
  flag: "Flag Only",
  archive: "Auto-Archive",
  notify: "Notify",
};

// ---------------------------------------------------------------------------
// Admin — Activity labels
// ---------------------------------------------------------------------------

export const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
  created: "Created",
  updated: "Updated",
  deleted: "Deleted",
  published: "Published",
  archived: "Archived",
  login: "Login",
  role_changed: "Role Changed",
  api_access: "API Access",
  source_validated: "Source Validated",
  trust_tier_changed: "Trust Tier Changed",
  file_uploaded: "File Uploaded",
  api_key_created: "API Key Created",
  api_key_revoked: "API Key Revoked",
};

export const ACTIVITY_CATEGORY_LABELS: Record<ActivityCategory, string> = {
  research: "Research",
  admin: "Admin",
  auth: "Authentication",
  system: "System",
  api: "API",
};

export const ACTIVITY_TARGET_TYPE_LABELS: Record<ActivityTargetType, string> = {
  research: "Research",
  context_document: "Context Document",
  prompt_template: "Prompt Template",
  ai_tool_profile: "AI Tool",
  user: "User",
  taxonomy: "Taxonomy",
};

// ---------------------------------------------------------------------------
// Agent API — Validation status labels
// ---------------------------------------------------------------------------

export const VALIDATION_STATUS_LABELS: Record<ValidationStatus, string> = {
  unverified: 'Unverified',
  corroborated: 'Corroborated',
  human_verified: 'Human Verified',
  disputed: 'Disputed',
};

// ---------------------------------------------------------------------------
// Agent API — Review status labels
// ---------------------------------------------------------------------------

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  none: 'No Review',
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

// ---------------------------------------------------------------------------
// Agent API — Research origin labels
// ---------------------------------------------------------------------------

export const RESEARCH_ORIGIN_LABELS: Record<ResearchOrigin, string> = {
  human: 'Human',
  agent: 'Agent',
  hybrid: 'Hybrid',
};

// ---------------------------------------------------------------------------
// Agent API — API key permission labels
// ---------------------------------------------------------------------------

export const API_KEY_PERMISSION_LABELS: Record<ApiKeyPermission, string> = {
  read: 'Read Only',
  read_write: 'Read & Write',
  admin: 'Admin',
};

// ---------------------------------------------------------------------------
// Admin — Business unit options
// ---------------------------------------------------------------------------

export const BUSINESS_UNITS: string[] = [
  "Security BU",
  "Cloud BU",
  "Digital Workspace BU",
  "AI BU",
];
