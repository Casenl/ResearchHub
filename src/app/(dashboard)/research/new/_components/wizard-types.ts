import React from "react";

import {
  FileText,
  BarChart3,
  Briefcase,
  Globe,
  Shield,
  Cloud,
  Monitor,
  Brain,
  Building2,
  Landmark,
  Factory,
  GraduationCap,
  ShoppingCart,
  Zap,
} from "lucide-react";

import type {
  ResearchType,
  OutputFormat,
  RefreshSchedule,
  ClonedChangedDimension,
  ContextDocumentCategory,
} from "@/types";

// =============================================================================
// Shared Types
// =============================================================================

export interface WizardFormState {
  // Step 1
  researchType: ResearchType;
  referenceResearchId: string;
  title: string;
  description: string;
  coreQuestion: string;
  outputFormat: OutputFormat;
  contextDescription: string;
  clonedChangedDimension: ClonedChangedDimension | null;
  // Step 2
  selectedMarketIds: string[];
  selectedDomainIds: string[];
  selectedSectorIds: string[];
  allSectors: boolean;
  // Step 3
  selectedContextDocIds: string[];
  refreshSchedule: RefreshSchedule;
  deadline: string;
  requesterName: string;
  requesterRole: string;
  // Step 4
  isGenerating: boolean;
  isGenerated: boolean;
}

export type ArrayToggleField =
  | "selectedMarketIds"
  | "selectedDomainIds"
  | "selectedSectorIds"
  | "selectedContextDocIds";

export interface WizardStepProps {
  form: WizardFormState;
  onUpdate: (updates: Partial<WizardFormState>) => void;
  onToggleArrayItem?: (field: ArrayToggleField, id: string) => void;
  errors?: Record<string, string>;
}

/** Local type matching the actual runtime shape from @/data/sectors. */
export interface SectorData {
  id: string;
  name: string;
  code: string;
  relevant_regulations: string[];
}

// =============================================================================
// Mock Data
// =============================================================================

export interface MockContextDocument {
  id: string;
  title: string;
  category: ContextDocumentCategory;
}

export const MOCK_CONTEXT_DOCUMENTS: MockContextDocument[] = [
  { id: "ctx-001", title: "ITQ Security Services Catalogue 2025", category: "service_description" },
  { id: "ctx-002", title: "ITQ Annual Strategy 2025-2027", category: "strategy" },
  { id: "ctx-003", title: "ITQ Services Lifecycle Model v3", category: "process_model" },
  { id: "ctx-004", title: "ENISA MSS Market Analysis 2024", category: "external_source" },
  { id: "ctx-005", title: "NIS2 Directive Full Text", category: "regulatory" },
  { id: "ctx-006", title: "Verizon DBIR 2024", category: "external_source" },
];

export const MOCK_EXISTING_RESEARCH = [
  { id: "res-001", title: "Netherlands Security Market Analysis Q3 2025" },
  { id: "res-002", title: "DACH Hybrid Cloud Competitive Landscape 2025" },
  { id: "res-003", title: "EU AI Services Regulatory Impact Assessment" },
];

// =============================================================================
// Label Maps
// =============================================================================

export const CONTEXT_CATEGORY_LABELS: Record<ContextDocumentCategory, string> = {
  service_description: "Service Description",
  strategy: "Strategy",
  process_model: "Process Model",
  external_source: "External Source",
  regulatory: "Regulatory",
  previous_research: "Previous Research",
};

export const OUTPUT_FORMAT_LABELS: Record<OutputFormat, string> = {
  factsheet: "Factsheet",
  competitive: "Competitive Analysis",
  proposition: "Proposition Foundation",
  full: "Full Market Analysis",
};

export const REFRESH_SCHEDULE_LABELS: Record<RefreshSchedule, string> = {
  quarterly: "Quarterly",
  semi_annually: "Semi-annually",
  ad_hoc: "Ad-hoc",
};

export const RESEARCH_TYPE_LABELS: Record<ResearchType, string> = {
  new: "New Research",
  refresh: "Refresh",
  clone: "Clone",
};

// =============================================================================
// Output Format Options
// =============================================================================

export interface OutputFormatOption {
  value: OutputFormat;
  label: string;
  description: string;
  icon: React.ElementType;
}

export const OUTPUT_FORMAT_OPTIONS: OutputFormatOption[] = [
  { value: "factsheet", label: "Factsheet", description: "Quick market data overview \u2014 1 page", icon: FileText },
  { value: "competitive", label: "Competitive Analysis", description: "Players, positioning, white spaces", icon: BarChart3 },
  { value: "proposition", label: "Proposition Foundation", description: "Problem Statements, VPC, BMC", icon: Briefcase },
  { value: "full", label: "Full Market Analysis", description: "Comprehensive \u2014 all formats combined", icon: Globe },
];

// =============================================================================
// Icon Mappings
// =============================================================================

export const DOMAIN_ICONS: Record<string, React.ElementType> = {
  "domain-sec": Shield,
  "domain-hc": Cloud,
  "domain-dw": Monitor,
  "domain-ai": Brain,
};

export const SECTOR_ICONS: Record<string, React.ElementType> = {
  "sector-hc": Building2,
  "sector-fs": Landmark,
  "sector-mfg": Factory,
  "sector-gov": Landmark,
  "sector-edu": GraduationCap,
  "sector-ret": ShoppingCart,
  "sector-enu": Zap,
};
