// =============================================================================
// ITQ Market Intelligence Portal — Prompt Template Engine
// =============================================================================
//
// Generates structured discovery & analysis prompts for each notebook type,
// parameterised by domain, geography, sector, and year range.
// =============================================================================

import type { NotebookType } from "@/types";

// -----------------------------------------------------------------------------
// Configuration Types
// -----------------------------------------------------------------------------

export interface PromptConfig {
  /** Domain code or name (e.g. "Security", "Hybrid Cloud"). */
  domain: string;
  /** Notebook type to generate prompts for. */
  notebookType: NotebookType;
  /** Geography / market name (e.g. "Netherlands", "DACH", "EU"). */
  geography?: string;
  /** Sector name (e.g. "Healthcare", "Financial Services"). */
  sector?: string;
  /** Sector-specific regulations to inject into regulatory prompts. */
  sectorRegulations?: string[];
  /** Year range string, e.g. "2024-2025". Defaults to (currentYear-1)-(currentYear). */
  yearRange?: string;
}

export interface GeneratedPrompts {
  discovery_prompt: string;
  analysis_prompts: string[];
}

export interface SynthesisConfig {
  /** Research title. */
  title: string;
  /** Domain name. */
  domain: string;
  /** Geography / market name. */
  geography: string;
  /** List of sectors covered. */
  sectors: string[];
  /** The core question the research must answer. */
  coreQuestion: string;
  /** Context description (why the research is needed). */
  contextDescription: string;
  /** List of notebook type labels produced. */
  notebookLabels: string[];
}

export interface RefreshComparisonConfig {
  /** Research title. */
  title: string;
  /** Domain name. */
  domain: string;
  /** Geography / market name. */
  geography: string;
  /** Date of the previous research version. */
  previousDate: string;
  /** Date of the current refresh. */
  currentDate: string;
}

// -----------------------------------------------------------------------------
// Domain-Specific Source Maps
// -----------------------------------------------------------------------------

const DOMAIN_SOURCE_MAP: Record<string, string> = {
  Security:
    "ENISA MSS Market Analysis, NCSC Annual Review, Verizon DBIR, SANS Institute, ISACA, CrowdStrike Global Threat Report, Gartner Market Guide MDR",
  "Hybrid Cloud":
    "Gartner MQ IaaS/PaaS, Flexera State of the Cloud, IDC Cloud Tracker, Uptime Institute, CISPE Reports",
  "Digital Workspace":
    "Gartner MQ UEM/VDI/DaaS, Forrester EUC Wave, Microsoft/VMware/Citrix Adoption Reports",
  "AI Services":
    "Stanford AI Index, McKinsey State of AI, EU AI Act Impact Analyses, OECD AI Policy Observatory",
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function getDefaultYearRange(): string {
  const currentYear = new Date().getFullYear();
  return `${currentYear - 1}-${currentYear}`;
}

function getDomainSources(domain: string): string {
  return DOMAIN_SOURCE_MAP[domain] ?? DOMAIN_SOURCE_MAP["Security"];
}

function formatSectorRegulations(regulations?: string[]): string {
  if (!regulations || regulations.length === 0) {
    return "NIS2, GDPR, and sector-specific compliance frameworks";
  }
  return regulations.join(", ");
}

// -----------------------------------------------------------------------------
// Notebook Type Labels
// -----------------------------------------------------------------------------

export const NOTEBOOK_TYPE_DISPLAY_LABELS: Record<NotebookType, string> = {
  market_regulation: "N1 - Market & Regulation",
  competitive: "N2 - Competitive Landscape",
  business_model: "N3 - Business Model & Proposition",
  local_sector: "N4 - Local Sector Deep-Dive",
};

// -----------------------------------------------------------------------------
// Template Functions per Notebook Type
// -----------------------------------------------------------------------------

function generateMarketRegulationPrompts(
  domain: string,
  geography: string,
  yearRange: string,
  domainSources: string,
  sectorRegulations: string
): GeneratedPrompts {
  return {
    discovery_prompt: `Find recent (${yearRange}) high-quality sources about the ${geography} ${domain} market. I'm specifically looking for: ${domainSources}. Exclude vendor marketing materials and commercial market research summaries without underlying data. Prioritise government/EU reports, independent annual reports, and analyst research. For each source found, state: title, publisher, publication date, and a one-line credibility assessment.`,
    analysis_prompts: [
      `Based on the sources, provide a market sizing analysis for ${domain} in ${geography}: total addressable market (TAM), serviceable addressable market (SAM), compound annual growth rate (CAGR), and segmentation by service type, deployment model, and organisation size. Cite specific sources for every number. Mark any estimates as [ESTIMATE].`,
      `Analyse the regulatory landscape as a demand driver for ${domain} services in ${geography}. Focus on: which regulations create demand for managed services (especially ${sectorRegulations}), implementation timelines, penalties for non-compliance, and scope of affected organisations. Present as a table where possible.`,
      `Analyse the threat and trend landscape driving urgency for ${domain} in ${geography}: incident statistics, cost of breach data, attack vector trends, and technology shifts. Use the most recent data available and cite sources for every statistic.`,
    ],
  };
}

function generateCompetitivePrompts(
  domain: string,
  geography: string,
  yearRange: string,
  domainSources: string
): GeneratedPrompts {
  return {
    discovery_prompt: `Find recent (${yearRange}) information about ${domain} service providers operating in ${geography}. I'm looking for: competitive landscape analyses, market guides, vendor comparisons, and independent reviews. Focus on: ${domainSources}. For each source, state: title, publisher, publication date, credibility assessment.`,
    analysis_prompts: [
      `Based on the sources, identify and categorise ${domain} service providers in ${geography}. Categorise by type: pure-play specialists, MSP+${domain}, telco/carrier, system integrator, Big4 consulting, hyperscaler. For each provider include: name, type, segment focus, key technology partnerships, estimated market position. Present as a comparison table.`,
      `Analyse the service delivery models for ${domain} in ${geography}. Compare the relevant models, their typical pricing structures, and which customer segments they serve. Identify white spaces \u2014 underserved segments or unmet needs. Cite sources.`,
    ],
  };
}

function generateBusinessModelPrompts(
  domain: string,
  geography: string,
  yearRange: string,
  domainSources: string
): GeneratedPrompts {
  return {
    discovery_prompt: `Find recent (${yearRange}) sources about building or acquiring ${domain} capabilities, pricing models, and business transformation in the managed services market. Look for: ${domainSources}, plus channel research from Canalys, ChannelE2E, CRN. For each source: title, publisher, date, credibility.`,
    analysis_prompts: [
      `Analyse the key transition challenges and success factors for building ${domain} capabilities. What does it take to build vs. buy vs. partner? Include: required investments, talent requirements, technology stack decisions, timeline expectations, and common pitfalls. Cite sources.`,
      `Analyse pricing and packaging models for ${domain} services in ${geography}. Include: market benchmark pricing, bundling strategies, margin indicators, and adjacent sales arguments (insurance, compliance-as-a-service, risk quantification). Present pricing data as tables where available. Cite sources.`,
    ],
  };
}

function generateLocalSectorPrompts(
  domain: string,
  geography: string,
  sector: string,
  yearRange: string
): GeneratedPrompts {
  return {
    discovery_prompt: `Find recent (${yearRange}) sources specifically about ${domain} in the ${sector} sector in ${geography}. Look for: sector-specific regulations, local market data, sector-specific providers, and customer case studies. For each source: title, publisher, date, credibility.`,
    analysis_prompts: [
      `Provide ${geography}-specific market data for ${domain} in the ${sector} sector: local market sizing, growth rates, key local players, regulatory timeline specific to this geography. Compare with broader European/global figures where available. Cite sources.`,
      `Validate assumed customer pain points for ${sector} organisations regarding ${domain} in ${geography}. For each common pain point, find 2+ data points that confirm or contradict it. Present as: Pain Point | Evidence For | Evidence Against | Confidence Level.`,
    ],
  };
}

// -----------------------------------------------------------------------------
// Main Export: generatePrompts
// -----------------------------------------------------------------------------

/**
 * Generate discovery and analysis prompts for a given notebook configuration.
 * Returns a structured object with the discovery prompt and an array of
 * analysis prompts, all with parameter substitution applied.
 */
export function generatePrompts(config: PromptConfig): GeneratedPrompts {
  const {
    domain,
    notebookType,
    geography = "EU",
    sector = "General",
    sectorRegulations,
    yearRange = getDefaultYearRange(),
  } = config;

  const domainSources = getDomainSources(domain);
  const regulations = formatSectorRegulations(sectorRegulations);

  switch (notebookType) {
    case "market_regulation":
      return generateMarketRegulationPrompts(
        domain,
        geography,
        yearRange,
        domainSources,
        regulations
      );

    case "competitive":
      return generateCompetitivePrompts(
        domain,
        geography,
        yearRange,
        domainSources
      );

    case "business_model":
      return generateBusinessModelPrompts(
        domain,
        geography,
        yearRange,
        domainSources
      );

    case "local_sector":
      return generateLocalSectorPrompts(domain, geography, sector, yearRange);

    default: {
      const _exhaustive: never = notebookType;
      throw new Error(`Unknown notebook type: ${_exhaustive}`);
    }
  }
}

// -----------------------------------------------------------------------------
// Synthesis Prompt
// -----------------------------------------------------------------------------

/**
 * Generate a synthesis prompt that combines findings from all notebooks
 * with ITQ context to produce a unified research output.
 */
export function generateSynthesisPrompt(config: SynthesisConfig): string {
  const {
    title,
    domain,
    geography,
    sectors,
    coreQuestion,
    contextDescription,
    notebookLabels,
  } = config;

  const sectorList =
    sectors.length > 0 ? sectors.join(", ") : "All sectors";
  const notebookList = notebookLabels
    .map((label, idx) => `${idx + 1}. ${label}`)
    .join("\n");

  return `You are synthesising research findings for the ITQ Market Intelligence Portal.

Research Title: ${title}
Domain: ${domain}
Geography: ${geography}
Sectors: ${sectorList}
Core Question: ${coreQuestion}
Context: ${contextDescription}

The following notebooks have been completed:
${notebookList}

Instructions:
1. Cross-reference findings across all notebooks. Identify where data points from different notebooks reinforce or contradict each other.
2. Answer the core question directly and concisely at the top of the synthesis.
3. Highlight the top 5 strategic insights for ITQ, ranked by actionability.
4. For each insight, provide:
   - The finding (1-2 sentences)
   - Supporting evidence with source citations
   - Confidence level (High / Medium / Low) based on source quality and corroboration
   - Recommended action for ITQ
5. Identify any gaps in the research where additional investigation is needed.
6. Flag any assumptions that need validation.
7. Present a summary table of key metrics (market size, growth rate, competitive intensity, regulatory pressure) with confidence indicators.

Format the output as structured Markdown suitable for executive review.`;
}

// -----------------------------------------------------------------------------
// Refresh Comparison Prompt
// -----------------------------------------------------------------------------

/**
 * Generate a refresh comparison prompt that compares new findings against
 * previous research and produces a structured change log.
 */
export function generateRefreshComparisonPrompt(
  config: RefreshComparisonConfig
): string {
  const { title, domain, geography, previousDate, currentDate } = config;

  return `You are performing a research refresh comparison for the ITQ Market Intelligence Portal.

Research Title: ${title}
Domain: ${domain}
Geography: ${geography}
Previous Research Date: ${previousDate}
Current Refresh Date: ${currentDate}

Compare the new findings against the previous research version and produce a structured change log.

Instructions:
1. Categorise all changes as: NEW (not in previous), UPDATED (changed data/conclusion), REMOVED (no longer relevant), UNCHANGED (confirmed, no change).
2. For each change, provide:
   - Category (NEW / UPDATED / REMOVED / UNCHANGED)
   - Topic area (e.g. "Market Sizing", "Regulatory", "Competitive")
   - Previous finding (if applicable)
   - Current finding
   - Impact assessment (High / Medium / Low) on ITQ strategy
   - Source citation
3. Highlight any trend reversals or significant shifts.
4. Provide a summary dashboard:
   - Total changes by category
   - Top 3 most impactful changes
   - Recommended actions based on changes
5. Flag any data points from the previous version that could not be re-validated.

Format the output as structured Markdown with clear section headers and tables where appropriate.`;
}

// -----------------------------------------------------------------------------
// Output Format to Notebook Types mapping
// -----------------------------------------------------------------------------

/**
 * Maps output format to the required notebook types.
 * - factsheet: N1 only
 * - competitive: N1 + N2
 * - proposition: N1 + N2 + N3
 * - full: N1 + N2 + N3 + N4
 */
export function getNotebookTypesForFormat(
  format: string
): NotebookType[] {
  switch (format) {
    case "factsheet":
      return ["market_regulation"];
    case "competitive":
      return ["market_regulation", "competitive"];
    case "proposition":
      return ["market_regulation", "competitive", "business_model"];
    case "full":
      return [
        "market_regulation",
        "competitive",
        "business_model",
        "local_sector",
      ];
    default:
      return ["market_regulation"];
  }
}
