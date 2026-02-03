"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
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
  Calendar,
  Copy,
  Sparkles,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import { MARKETS } from "@/data/markets";
import { DOMAINS } from "@/data/domains";
import { SECTORS } from "@/data/sectors";

/** Local type matching the actual runtime shape from @/data/markets. */
interface MarketData {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
}

/** Local type matching the actual runtime shape from @/data/sectors. */
interface SectorData {
  id: string;
  name: string;
  code: string;
  relevantRegulations: string[];
}

import type {
  ResearchType,
  OutputFormat,
  RefreshSchedule,
  ClonedChangedDimension,
  NotebookType,
  ContextDocumentCategory,
} from "@/types";

import {
  generatePrompts,
  getNotebookTypesForFormat,
  NOTEBOOK_TYPE_DISPLAY_LABELS,
} from "@/lib/prompt-templates";

// =============================================================================
// Mock Data
// =============================================================================

interface MockContextDocument {
  id: string;
  title: string;
  category: ContextDocumentCategory;
}

const MOCK_CONTEXT_DOCUMENTS: MockContextDocument[] = [
  {
    id: "ctx-001",
    title: "ITQ Security Services Catalogue 2025",
    category: "service_description",
  },
  {
    id: "ctx-002",
    title: "ITQ Annual Strategy 2025-2027",
    category: "strategy",
  },
  {
    id: "ctx-003",
    title: "ITQ Services Lifecycle Model v3",
    category: "process_model",
  },
  {
    id: "ctx-004",
    title: "ENISA MSS Market Analysis 2024",
    category: "external_source",
  },
  {
    id: "ctx-005",
    title: "NIS2 Directive Full Text",
    category: "regulatory",
  },
  {
    id: "ctx-006",
    title: "Verizon DBIR 2024",
    category: "external_source",
  },
];

const MOCK_EXISTING_RESEARCH = [
  {
    id: "res-001",
    title: "Netherlands Security Market Analysis Q3 2025",
  },
  {
    id: "res-002",
    title: "DACH Hybrid Cloud Competitive Landscape 2025",
  },
  {
    id: "res-003",
    title: "EU AI Services Regulatory Impact Assessment",
  },
];

// =============================================================================
// Category Labels
// =============================================================================

const CONTEXT_CATEGORY_LABELS: Record<ContextDocumentCategory, string> = {
  service_description: "Service Description",
  strategy: "Strategy",
  process_model: "Process Model",
  external_source: "External Source",
  regulatory: "Regulatory",
  previous_research: "Previous Research",
};

// =============================================================================
// Domain Icon Mapping
// =============================================================================

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  "domain-sec": Shield,
  "domain-hc": Cloud,
  "domain-dw": Monitor,
  "domain-ai": Brain,
};

// =============================================================================
// Sector Icon Mapping
// =============================================================================

const SECTOR_ICONS: Record<string, React.ElementType> = {
  "sector-hc": Building2,
  "sector-fs": Landmark,
  "sector-mfg": Factory,
  "sector-gov": Landmark,
  "sector-edu": GraduationCap,
  "sector-ret": ShoppingCart,
  "sector-enu": Zap,
};

// =============================================================================
// Form State
// =============================================================================

interface WizardFormState {
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

const initialFormState: WizardFormState = {
  researchType: "new",
  referenceResearchId: "",
  title: "",
  description: "",
  coreQuestion: "",
  outputFormat: "factsheet",
  contextDescription: "",
  clonedChangedDimension: null,
  selectedMarketIds: [],
  selectedDomainIds: [],
  selectedSectorIds: [],
  allSectors: false,
  selectedContextDocIds: [],
  refreshSchedule: "quarterly",
  deadline: "",
  requesterName: "Jan de Vries",
  requesterRole: "Domain Lead - Security",
  isGenerating: false,
  isGenerated: false,
};

// =============================================================================
// Output Format Config
// =============================================================================

interface OutputFormatOption {
  value: OutputFormat;
  label: string;
  description: string;
  icon: React.ElementType;
}

const OUTPUT_FORMAT_OPTIONS: OutputFormatOption[] = [
  {
    value: "factsheet",
    label: "Factsheet",
    description: "Quick market data overview \u2014 1 page",
    icon: FileText,
  },
  {
    value: "competitive",
    label: "Competitive Analysis",
    description: "Players, positioning, white spaces",
    icon: BarChart3,
  },
  {
    value: "proposition",
    label: "Proposition Foundation",
    description: "Problem Statements, VPC, BMC",
    icon: Briefcase,
  },
  {
    value: "full",
    label: "Full Market Analysis",
    description: "Comprehensive \u2014 all formats combined",
    icon: Globe,
  },
];

// =============================================================================
// Step Indicator Component
// =============================================================================

function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const stepLabels = [
    "Define Research",
    "Select Dimensions",
    "Context & Schedule",
    "Review & Generate",
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isUpcoming = step > currentStep;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isCompleted &&
                      "border-green-600 bg-green-600 text-white",
                    isCurrent &&
                      "border-blue-600 bg-blue-600 text-white",
                    isUpcoming &&
                      "border-gray-300 bg-white text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium",
                    isCompleted && "text-green-700",
                    isCurrent && "text-blue-700",
                    isUpcoming && "text-gray-400"
                  )}
                >
                  {stepLabels[i]}
                </span>
              </div>
              {step < totalSteps && (
                <div
                  className={cn(
                    "mt-[-1.25rem] h-0.5 flex-1 mx-3 transition-colors",
                    step < currentStep ? "bg-green-600" : "bg-gray-200"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <p className="mt-4 text-center text-sm text-gray-500">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
}

// =============================================================================
// Copyable Prompt Component
// =============================================================================

function CopyablePrompt({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [value]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            copied
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <textarea
        readOnly
        value={value}
        rows={5}
        className="flex w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 font-mono leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    </div>
  );
}

// =============================================================================
// Market Hierarchy Component
// =============================================================================

function MarketHierarchy({
  selectedIds,
  onToggle,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const rootMarkets = (MARKETS as unknown as MarketData[]).filter((m) => m.parentId === null);

  function renderMarket(marketId: string, depth: number) {
    const market = (MARKETS as unknown as MarketData[]).find((m) => m.id === marketId);
    if (!market) return null;

    const children = (MARKETS as unknown as MarketData[]).filter((m) => m.parentId === marketId);
    const isSelected = selectedIds.includes(market.id);

    return (
      <div key={market.id}>
        <button
          type="button"
          onClick={() => onToggle(market.id)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors text-left",
            isSelected
              ? "bg-blue-50 text-blue-800 font-medium"
              : "text-gray-700 hover:bg-gray-50"
          )}
          style={{ paddingLeft: `${depth * 1.25 + 0.75}rem` }}
        >
          <Globe className="h-4 w-4 shrink-0 text-gray-400" />
          <span>{market.name}</span>
          <span className="ml-auto text-xs text-gray-400">{market.code}</span>
          {isSelected && <Check className="h-4 w-4 text-blue-600 shrink-0" />}
        </button>
        {children.map((child) => renderMarket(child.id, depth + 1))}
      </div>
    );
  }

  return (
    <div className="space-y-0.5 rounded-md border border-gray-200 p-2 max-h-72 overflow-y-auto">
      {rootMarkets.map((market) => renderMarket(market.id, 0))}
    </div>
  );
}

// =============================================================================
// Page Component
// =============================================================================

export default function NewResearchPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<WizardFormState>(initialFormState);

  const totalSteps = 4;

  // ---------------------------------------------------------------------------
  // Form helpers
  // ---------------------------------------------------------------------------

  const updateForm = useCallback(
    (updates: Partial<WizardFormState>) => {
      setForm((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const toggleArrayItem = useCallback(
    (
      field: "selectedMarketIds" | "selectedDomainIds" | "selectedSectorIds" | "selectedContextDocIds",
      id: string
    ) => {
      setForm((prev) => {
        const arr = prev[field];
        const next = arr.includes(id)
          ? arr.filter((v) => v !== id)
          : [...arr, id];
        return { ...prev, [field]: next };
      });
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const goNext = () => {
    if (currentStep < totalSteps) setCurrentStep((s) => s + 1);
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  // ---------------------------------------------------------------------------
  // Generation logic
  // ---------------------------------------------------------------------------

  const handleGenerate = useCallback(() => {
    updateForm({ isGenerating: true });
    // Simulate a short generation delay
    setTimeout(() => {
      updateForm({ isGenerating: false, isGenerated: true });
    }, 1200);
  }, [updateForm]);

  // ---------------------------------------------------------------------------
  // Look-up helpers
  // ---------------------------------------------------------------------------

  const getSelectedMarkets = () =>
    MARKETS.filter((m) => form.selectedMarketIds.includes(m.id));

  const getSelectedDomains = () =>
    DOMAINS.filter((d) => form.selectedDomainIds.includes(d.id));

  const getSelectedSectors = () =>
    form.allSectors
      ? SECTORS
      : SECTORS.filter((s) => form.selectedSectorIds.includes(s.id));

  const getNotebookTypes = (): NotebookType[] =>
    getNotebookTypesForFormat(form.outputFormat);

  const getGeneratedNotebooks = () => {
    const notebookTypes = getNotebookTypes();
    const domains = getSelectedDomains();
    const markets = getSelectedMarkets();
    const sectors = getSelectedSectors();

    const primaryDomain = domains[0]?.name ?? "Security";
    const primaryGeography = markets[0]?.name ?? "EU";
    const primarySector = sectors[0]?.name ?? "General";
    const sectorRegulations = (sectors[0] as unknown as SectorData)?.relevantRegulations ?? [];

    return notebookTypes.map((type) => {
      const prompts = generatePrompts({
        domain: primaryDomain,
        notebookType: type,
        geography: primaryGeography,
        sector: primarySector,
        sectorRegulations,
      });

      return {
        type,
        label: NOTEBOOK_TYPE_DISPLAY_LABELS[type],
        ...prompts,
      };
    });
  };

  // ---------------------------------------------------------------------------
  // Format labels
  // ---------------------------------------------------------------------------

  const OUTPUT_FORMAT_LABELS: Record<OutputFormat, string> = {
    factsheet: "Factsheet",
    competitive: "Competitive Analysis",
    proposition: "Proposition Foundation",
    full: "Full Market Analysis",
  };

  const REFRESH_SCHEDULE_LABELS: Record<RefreshSchedule, string> = {
    quarterly: "Quarterly",
    semi_annually: "Semi-annually",
    ad_hoc: "Ad-hoc",
  };

  const RESEARCH_TYPE_LABELS: Record<ResearchType, string> = {
    new: "New Research",
    refresh: "Refresh",
    clone: "Clone",
  };

  // ===========================================================================
  // Step 1: Define Research
  // ===========================================================================

  function renderStep1() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Define Your Research</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Research Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Research Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { value: "new", label: "New", desc: "Start fresh" },
                  {
                    value: "refresh",
                    label: "Refresh",
                    desc: "Update existing research",
                  },
                  {
                    value: "clone",
                    label: "Clone",
                    desc: "Copy and adjust a dimension",
                  },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    updateForm({
                      researchType: opt.value,
                      referenceResearchId: "",
                      clonedChangedDimension: null,
                    })
                  }
                  className={cn(
                    "rounded-lg border-2 p-4 text-left transition-colors",
                    form.researchType === opt.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <span className="block text-sm font-semibold text-gray-900">
                    {opt.label}
                  </span>
                  <span className="block text-xs text-gray-500 mt-1">
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reference Research (Refresh / Clone) */}
          {(form.researchType === "refresh" ||
            form.researchType === "clone") && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Reference Research
              </label>
              <select
                value={form.referenceResearchId}
                onChange={(e) =>
                  updateForm({ referenceResearchId: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select existing research...</option>
                {MOCK_EXISTING_RESEARCH.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clone Changed Dimension */}
          {form.researchType === "clone" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Which dimension is changing?
              </label>
              <div className="flex gap-3">
                {(
                  [
                    { value: "market", label: "Market" },
                    { value: "domain", label: "Domain" },
                    { value: "sector", label: "Sector" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      updateForm({ clonedChangedDimension: opt.value })
                    }
                    className={cn(
                      "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                      form.clonedChangedDimension === opt.value
                        ? "border-blue-600 bg-blue-50 text-blue-800"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Title
            </label>
            <Input
              placeholder="e.g. Netherlands Security Market Analysis Q1 2026"
              value={form.title}
              onChange={(e) => updateForm({ title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <Textarea
              placeholder="Brief description of the research scope and goals..."
              value={form.description}
              onChange={(e) => updateForm({ description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Core Question */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Core Question
            </label>
            <p className="text-xs text-gray-500">
              What must this research answer?
            </p>
            <Textarea
              placeholder="e.g. What is the current state and growth trajectory of the managed security services market in the Netherlands, and where are the underserved segments?"
              value={form.coreQuestion}
              onChange={(e) => updateForm({ coreQuestion: e.target.value })}
              rows={3}
            />
          </div>

          {/* Output Format */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Output Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {OUTPUT_FORMAT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateForm({ outputFormat: opt.value })}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors",
                      form.outputFormat === opt.value
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 mt-0.5 shrink-0",
                        form.outputFormat === opt.value
                          ? "text-blue-600"
                          : "text-gray-400"
                      )}
                    />
                    <div>
                      <span className="block text-sm font-semibold text-gray-900">
                        {opt.label}
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        {opt.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Context Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Context
            </label>
            <p className="text-xs text-gray-500">
              Why is this research needed?
            </p>
            <Textarea
              placeholder="e.g. ITQ is evaluating entry into the Dutch managed security market. We need to understand market size, competitive landscape, and regulatory drivers to build a business case."
              value={form.contextDescription}
              onChange={(e) =>
                updateForm({ contextDescription: e.target.value })
              }
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // ===========================================================================
  // Step 2: Select Dimensions
  // ===========================================================================

  function renderStep2() {
    const selectedMarkets = getSelectedMarkets();
    const selectedDomains = getSelectedDomains();
    const selectedSectors = getSelectedSectors();

    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Dimensions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Markets */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Markets
            </label>
            <p className="text-xs text-gray-500">
              Select one or more geographic markets for this research.
            </p>
            <MarketHierarchy
              selectedIds={form.selectedMarketIds}
              onToggle={(id) => toggleArrayItem("selectedMarketIds", id)}
            />
            {selectedMarkets.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedMarkets.map((m) => (
                  <Badge
                    key={m.id}
                    variant="default"
                    className="px-2.5 py-0.5 text-sm gap-1.5 cursor-pointer"
                    onClick={() =>
                      toggleArrayItem("selectedMarketIds", m.id)
                    }
                  >
                    {m.name}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Domains */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Domains
            </label>
            <p className="text-xs text-gray-500">
              Select the technology domains to investigate.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {DOMAINS.map((domain) => {
                const Icon = DOMAIN_ICONS[domain.id] ?? Shield;
                const isSelected = form.selectedDomainIds.includes(
                  domain.id
                );
                return (
                  <button
                    key={domain.id}
                    type="button"
                    onClick={() =>
                      toggleArrayItem("selectedDomainIds", domain.id)
                    }
                    className={cn(
                      "flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors",
                      isSelected
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 mt-0.5 shrink-0",
                        isSelected ? "text-blue-600" : "text-gray-400"
                      )}
                    />
                    <div className="min-w-0">
                      <span className="block text-sm font-semibold text-gray-900">
                        {domain.name}
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {domain.description}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-blue-600 shrink-0 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
            {selectedDomains.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedDomains.map((d) => (
                  <Badge
                    key={d.id}
                    variant="info"
                    className="px-2.5 py-0.5 text-sm gap-1.5 cursor-pointer"
                    onClick={() =>
                      toggleArrayItem("selectedDomainIds", d.id)
                    }
                  >
                    {d.name}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Sectors */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Sectors
            </label>
            <p className="text-xs text-gray-500">
              Select specific sectors or include all.
            </p>

            {/* All sectors toggle */}
            <button
              type="button"
              onClick={() =>
                updateForm({
                  allSectors: !form.allSectors,
                  selectedSectorIds: [],
                })
              }
              className={cn(
                "flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors w-full",
                form.allSectors
                  ? "border-blue-600 bg-blue-50 text-blue-800"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                  form.allSectors
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300"
                )}
              >
                {form.allSectors && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>
              All Sectors
            </button>

            {!form.allSectors && (
              <div className="grid grid-cols-2 gap-2">
                {SECTORS.map((sector) => {
                  const Icon = SECTOR_ICONS[sector.id] ?? Building2;
                  const isSelected = form.selectedSectorIds.includes(
                    sector.id
                  );
                  return (
                    <button
                      key={sector.id}
                      type="button"
                      onClick={() =>
                        toggleArrayItem("selectedSectorIds", sector.id)
                      }
                      className={cn(
                        "flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-sm text-left transition-colors",
                        isSelected
                          ? "border-blue-600 bg-blue-50 text-blue-800 font-medium"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                      <span>{sector.name}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-600 shrink-0 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {!form.allSectors && selectedSectors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSectors.map((s) => (
                  <Badge
                    key={s.id}
                    variant="warning"
                    className="px-2.5 py-0.5 text-sm gap-1.5 cursor-pointer"
                    onClick={() =>
                      toggleArrayItem("selectedSectorIds", s.id)
                    }
                  >
                    {s.name}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ===========================================================================
  // Step 3: Context & Schedule
  // ===========================================================================

  function renderStep3() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Context & Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Context Library Documents */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Context Library Documents
            </label>
            <p className="text-xs text-gray-500">
              Select documents to provide context for this research.
            </p>
            <div className="space-y-2 rounded-md border border-gray-200 p-3">
              {MOCK_CONTEXT_DOCUMENTS.map((doc) => {
                const isSelected = form.selectedContextDocIds.includes(
                  doc.id
                );
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() =>
                      toggleArrayItem("selectedContextDocIds", doc.id)
                    }
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
                      isSelected
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                        isSelected
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300"
                      )}
                    >
                      {isSelected && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-gray-900">
                        {doc.title}
                      </span>
                    </div>
                    <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                      {CONTEXT_CATEGORY_LABELS[doc.category]}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Refresh Schedule */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Refresh Schedule
            </label>
            <div className="flex gap-3">
              {(
                [
                  { value: "quarterly", label: "Quarterly" },
                  { value: "semi_annually", label: "Semi-annually" },
                  { value: "ad_hoc", label: "Ad-hoc" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    updateForm({ refreshSchedule: opt.value })
                  }
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors",
                    form.refreshSchedule === opt.value
                      ? "border-blue-600 bg-blue-50 text-blue-800"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  <Calendar
                    className={cn(
                      "h-4 w-4",
                      form.refreshSchedule === opt.value
                        ? "text-blue-600"
                        : "text-gray-400"
                    )}
                  />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Deadline
            </label>
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => updateForm({ deadline: e.target.value })}
            />
          </div>

          {/* Requester */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Requester Name
              </label>
              <Input
                value={form.requesterName}
                onChange={(e) =>
                  updateForm({ requesterName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Role
              </label>
              <Input
                value={form.requesterRole}
                onChange={(e) =>
                  updateForm({ requesterRole: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ===========================================================================
  // Step 4: Review & Generate
  // ===========================================================================

  function renderStep4() {
    const selectedMarkets = getSelectedMarkets();
    const selectedDomains = getSelectedDomains();
    const selectedSectors = getSelectedSectors();
    const selectedDocs = MOCK_CONTEXT_DOCUMENTS.filter((d) =>
      form.selectedContextDocIds.includes(d.id)
    );

    return (
      <div className="space-y-6">
        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Research Brief Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Header */}
              <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">
                    {form.title || "Untitled Research"}
                  </h3>
                  <Badge variant="default" className="px-2.5 py-0.5 text-sm">
                    {RESEARCH_TYPE_LABELS[form.researchType]}
                  </Badge>
                </div>
                {form.description && (
                  <p className="text-sm text-gray-600">{form.description}</p>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">
                    Output Format
                  </span>
                  <p className="text-gray-900 mt-0.5">
                    {OUTPUT_FORMAT_LABELS[form.outputFormat]}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">
                    Refresh Schedule
                  </span>
                  <p className="text-gray-900 mt-0.5">
                    {REFRESH_SCHEDULE_LABELS[form.refreshSchedule]}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Requester</span>
                  <p className="text-gray-900 mt-0.5">
                    {form.requesterName}
                    {form.requesterRole && (
                      <span className="text-gray-500">
                        {" "}
                        &middot; {form.requesterRole}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Deadline</span>
                  <p className="text-gray-900 mt-0.5">
                    {form.deadline || "Not set"}
                  </p>
                </div>
              </div>

              {/* Core Question */}
              {form.coreQuestion && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Core Question
                  </span>
                  <p className="text-sm text-gray-900 mt-1 bg-amber-50 border border-amber-200 rounded-md p-3">
                    {form.coreQuestion}
                  </p>
                </div>
              )}

              {/* Context Description */}
              {form.contextDescription && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Context
                  </span>
                  <p className="text-sm text-gray-700 mt-1">
                    {form.contextDescription}
                  </p>
                </div>
              )}

              {/* Dimensions */}
              <div className="space-y-3">
                <span className="text-sm font-medium text-gray-500">
                  Dimensions
                </span>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Markets
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {selectedMarkets.length > 0 ? (
                        selectedMarkets.map((m) => (
                          <Badge key={m.id} variant="default" className="px-2 py-0.5 text-xs">
                            {m.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">
                          None selected
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Domains
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {selectedDomains.length > 0 ? (
                        selectedDomains.map((d) => (
                          <Badge key={d.id} variant="info" className="px-2 py-0.5 text-xs">
                            {d.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">
                          None selected
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Sectors
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {form.allSectors ? (
                        <Badge variant="warning" className="px-2 py-0.5 text-xs">
                          All Sectors
                        </Badge>
                      ) : selectedSectors.length > 0 ? (
                        selectedSectors.map((s) => (
                          <Badge key={s.id} variant="warning" className="px-2 py-0.5 text-xs">
                            {s.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">
                          None selected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Context Documents */}
              {selectedDocs.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Context Documents
                  </span>
                  <ul className="mt-1.5 space-y-1">
                    {selectedDocs.map((doc) => (
                      <li
                        key={doc.id}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <FileText className="h-3.5 w-3.5 text-gray-400" />
                        {doc.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reference Research (Refresh/Clone) */}
              {form.referenceResearchId && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Reference Research
                  </span>
                  <p className="text-sm text-gray-700 mt-0.5">
                    {MOCK_EXISTING_RESEARCH.find(
                      (r) => r.id === form.referenceResearchId
                    )?.title ?? form.referenceResearchId}
                  </p>
                  {form.clonedChangedDimension && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Changed dimension:{" "}
                      <span className="font-medium capitalize">
                        {form.clonedChangedDimension}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        {!form.isGenerated && (
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={form.isGenerating}
              className="gap-2"
            >
              {form.isGenerating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Notebook Structure & Prompts
                </>
              )}
            </Button>
          </div>
        )}

        {/* Generated Notebooks */}
        {form.isGenerated && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-green-700">
              <Check className="h-5 w-5" />
              <span className="text-sm font-semibold">
                Notebook structure generated successfully
              </span>
            </div>

            <p className="text-sm text-gray-600">
              Based on the{" "}
              <strong>{OUTPUT_FORMAT_LABELS[form.outputFormat]}</strong>{" "}
              format, the following notebooks are needed:
            </p>

            {getGeneratedNotebooks().map((notebook) => (
              <Card key={notebook.type}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge variant="info" className="px-2.5 py-0.5 text-sm">
                      {notebook.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CopyablePrompt
                    label="Discovery Prompt"
                    value={notebook.discovery_prompt}
                  />
                  {notebook.analysis_prompts.map((prompt, idx) => (
                    <CopyablePrompt
                      key={idx}
                      label={`Analysis Prompt ${idx + 1}`}
                      value={prompt}
                    />
                  ))}
                </CardContent>
              </Card>
            ))}

            {/* Create Button */}
            <div className="flex justify-center pt-2">
              <Button size="lg" className="gap-2">
                <Check className="h-5 w-5" />
                Create Research Project
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <div className="mx-auto max-w-3xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          New Research Project
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Set up a new market intelligence research project with structured
          prompts and notebook generation.
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

      {/* Step Content */}
      <div className="mb-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 1 ? (
            <Button variant="outline" onClick={goBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button variant="ghost" asChild className="gap-2 text-gray-500">
              <Link href="/research">
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </Link>
            </Button>
          )}
        </div>
        <div>
          {currentStep < totalSteps ? (
            <Button onClick={goNext} className="gap-2">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" asChild className="gap-2 text-gray-500">
              <Link href="/research">
                Cancel
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
