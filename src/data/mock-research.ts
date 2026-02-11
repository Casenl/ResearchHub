import type {
  Research,
  ResearchStatus,
  ResearchType,
  OutputFormat,
  RefreshSchedule,
  NotebookType,
  ResearchTool,
  Market,
  Domain,
  Sector,
} from "@/types";

// ---------------------------------------------------------------------------
// Dimension references (matching @/types interfaces, derived from seed data)
// ---------------------------------------------------------------------------

const MARKET_NL: Market = {
  id: "market-nl",
  name: "Netherlands",
  code: "NL",
  parent_id: "market-bnl",
};

const MARKET_BNL: Market = {
  id: "market-bnl",
  name: "Benelux",
  code: "BNL",
  parent_id: "market-eu",
};

const MARKET_EU: Market = {
  id: "market-eu",
  name: "EU",
  code: "EU",
  parent_id: "market-glb",
};

const MARKET_BE: Market = {
  id: "market-be",
  name: "Belgium",
  code: "BE",
  parent_id: "market-bnl",
};

const DOMAIN_SEC: Domain = {
  id: "domain-sec",
  name: "Security",
  code: "SEC",
  description:
    "Managed security services, SOC, MDR, vulnerability management, identity & access",
  default_sources: [
    "ENISA MSS Market Analysis",
    "NCSC Annual Review",
    "Gartner Market Guide MDR",
  ],
  itq_service_catalogue_ref: "SEC-001",
};

const DOMAIN_HC: Domain = {
  id: "domain-hc",
  name: "Hybrid Cloud",
  code: "HC",
  description:
    "Cloud infrastructure, multi-cloud management, cloud migration, IaaS/PaaS",
  default_sources: [
    "Gartner MQ IaaS/PaaS",
    "Flexera State of the Cloud",
    "IDC Cloud Tracker",
  ],
  itq_service_catalogue_ref: "HC-001",
};

const DOMAIN_DW: Domain = {
  id: "domain-dw",
  name: "Digital Workspace",
  code: "DW",
  description:
    "End-user computing, VDI, DaaS, UEM, collaboration tools",
  default_sources: [
    "Gartner MQ UEM/VDI/DaaS",
    "Forrester EUC Wave",
  ],
  itq_service_catalogue_ref: "DW-001",
};

const DOMAIN_AI: Domain = {
  id: "domain-ai",
  name: "AI Services",
  code: "AI",
  description:
    "AI/ML services, AI infrastructure, AI strategy consulting",
  default_sources: [
    "Stanford AI Index",
    "McKinsey State of AI",
    "EU AI Act Impact Analyses",
  ],
  itq_service_catalogue_ref: "AI-001",
};

const SECTOR_FS: Sector = {
  id: "sector-fs",
  name: "Financial Services",
  code: "FS",
  relevant_regulations: ["DORA", "NIS2", "GDPR", "PSD2"],
};

const SECTOR_EDU: Sector = {
  id: "sector-edu",
  name: "Education",
  code: "EDU",
  relevant_regulations: ["GDPR", "NIS2"],
};

const SECTOR_GOV: Sector = {
  id: "sector-gov",
  name: "Government",
  code: "GOV",
  relevant_regulations: [
    "NIS2",
    "GDPR",
    "Baseline Informatiebeveiliging Overheid (BIO)",
  ],
};

const SECTOR_HC: Sector = {
  id: "sector-hc",
  name: "Healthcare",
  code: "HC",
  relevant_regulations: ["NIS2", "GDPR", "Medical Device Regulation"],
};

// ---------------------------------------------------------------------------
// Mock Research Data
// ---------------------------------------------------------------------------

export const MOCK_RESEARCH: Research[] = [
  // ---- 1. Published — Security, Netherlands ----
  {
    id: "research-1",
    title: "Dutch Managed Security Services Market 2025",
    description:
      "Comprehensive analysis of the managed security services (MSS) market in the Netherlands, covering SOC-as-a-Service, MDR, and vulnerability management. Includes vendor landscape, buyer trends, and regulatory drivers such as NIS2.",
    type: "new" as ResearchType,
    previous_version_id: null,
    cloned_from_id: null,
    cloned_changed_dimension: null,
    status: "published" as ResearchStatus,
    output_format: "full" as OutputFormat,
    created_at: "2025-01-10T09:00:00Z",
    updated_at: "2025-03-15T14:30:00Z",
    published_at: "2025-03-15T14:30:00Z",
    expires_at: "2025-09-15T00:00:00Z",
    refresh_schedule: "quarterly" as RefreshSchedule,
    next_refresh_date: "2025-06-15",
    author_id: "user-1",
    reviewer_id: "user-2",
    dimensions: {
      markets: [MARKET_NL],
      domains: [DOMAIN_SEC],
      sectors: [],
    },
    tags: [
      { id: "tag-nis2", name: "NIS2", type: "system" },
      { id: "tag-zero-trust", name: "Zero Trust", type: "system" },
    ],
    context_documents: [
      {
        id: "ctx-1",
        title: "ITQ Managed Security Service Description v3.2",
        description:
          "Current service catalogue entry for ITQ managed security offerings",
        category: "service_description",
        file_url: "https://storage.example.com/ctx-1.pdf",
        file_type: "pdf",
        domain_ids: ["domain-sec"],
        market_ids: ["market-nl"],
        sector_ids: [],
        valid_from: "2024-01-01",
        valid_until: "2025-12-31",
        uploaded_by: "user-1",
        updated_at: "2024-12-01T10:00:00Z",
        version: 3,
        tag_ids: ["tag-nis2"],
      },
    ],
    notebooks: [
      {
        id: "nb-1-1",
        type: "market_regulation" as NotebookType,
        research_tool: "notebooklm" as ResearchTool,
        discovery_prompt:
          "Analyse the current state of the managed security services market in the Netherlands, focusing on SOC-as-a-Service adoption rates, key vendor positioning, and the impact of NIS2 directive compliance requirements on buyer behaviour.",
        analysis_prompts: [
          "What are the top 5 MSS providers in the Netherlands by market share?",
          "How has NIS2 changed procurement patterns for managed security?",
          "What is the average contract value and duration for SOC-as-a-Service in the Dutch mid-market?",
        ],
        sources: [
          {
            id: "src-1-1",
            title: "ENISA Managed Security Services Market Analysis 2024",
            url: "https://www.enisa.europa.eu/publications/mss-market-2024",
            publisher: "ENISA",
            publication_date: "2024-11-15",
            quality_tier: 1,
            discovered_by: "notebooklm",
            notes:
              "Primary EU-level reference for MSS market sizing and trends",
            validation_status: "unverified",
            validated_by: null,
            validated_at: null,
            validation_notes: "",
          },
          {
            id: "src-1-2",
            title: "NCSC Annual Cyber Security Assessment Netherlands 2024",
            url: "https://english.ncsc.nl/publications/csa-2024",
            publisher: "NCSC Netherlands",
            publication_date: "2024-10-01",
            quality_tier: 1,
            discovered_by: "notebooklm",
            notes:
              "National threat landscape context for MSS demand drivers",
            validation_status: "unverified",
            validated_by: null,
            validated_at: null,
            validation_notes: "",
          },
          {
            id: "src-1-3",
            title: "Gartner Market Guide for Managed Detection and Response 2024",
            url: "https://www.gartner.com/en/documents/mdr-guide-2024",
            publisher: "Gartner",
            publication_date: "2024-08-20",
            quality_tier: 3,
            discovered_by: "claude",
            notes: "Global MDR vendor landscape with European coverage",
            validation_status: "unverified",
            validated_by: null,
            validated_at: null,
            validation_notes: "",
          },
        ],
        findings:
          "## Key Findings\n\nThe Dutch MSS market is projected to grow at **12.4% CAGR** through 2027, driven primarily by NIS2 compliance requirements and an acute shortage of qualified security professionals.\n\n### Market Size\n- 2024 estimated market value: EUR 890M\n- Mid-market segment growing fastest at 18% YoY\n\n### Vendor Landscape\n- Top 5 vendors hold ~45% market share\n- Significant consolidation through M&A activity\n- Growing demand for Dutch-language SOC capabilities\n\n### NIS2 Impact\n- 67% of surveyed organisations cite NIS2 as primary driver for MSS adoption\n- Compliance deadline driving urgency in procurement cycles",
      },
      {
        id: "nb-1-2",
        type: "competitive" as NotebookType,
        research_tool: "claude" as ResearchTool,
        discovery_prompt:
          "Map the competitive landscape of managed security service providers in the Netherlands.",
        analysis_prompts: [
          "Which vendors have the strongest SOC capabilities in the Netherlands?",
          "What differentiates ITQ from competitors in the Dutch MSS market?",
        ],
        sources: [
          {
            id: "src-1-4",
            title: "Computable MSS Provider Ranking Netherlands 2024",
            url: "https://www.computable.nl/mss-ranking-2024",
            publisher: "Computable",
            publication_date: "2024-09-10",
            quality_tier: 5,
            discovered_by: "perplexity",
            notes: "Dutch IT trade press annual vendor ranking",
            validation_status: "unverified",
            validated_by: null,
            validated_at: null,
            validation_notes: "",
          },
        ],
        findings:
          "## Competitive Landscape\n\nThe Dutch MSS market features a mix of global players (Accenture, IBM, NTT) and strong local providers (KPN Security, Fox-IT, Northwave).\n\n### ITQ Positioning\n- Strong mid-market focus differentiates from enterprise-heavy global players\n- Hybrid cloud security expertise is a unique selling point\n- Partnership ecosystem (VMware, Palo Alto) provides technology depth",
      },
    ],
    synthesis:
      "## Dutch Managed Security Services Market — Synthesis\n\nThe Netherlands MSS market represents a significant growth opportunity driven by NIS2 compliance, a persistent cybersecurity talent gap, and accelerating digital transformation. The market is expected to reach **EUR 1.2B by 2027** at a 12.4% CAGR.\n\n### Strategic Implications for ITQ\n1. **NIS2-driven demand** creates a window of opportunity for MSS providers with strong compliance advisory capabilities\n2. **Mid-market segment** is underserved by global vendors, presenting ITQ's sweet spot\n3. **Dutch-language SOC** capability is a competitive differentiator\n4. **Hybrid cloud security** integration is increasingly valued by buyers\n\n### Recommendations\n- Accelerate NIS2 compliance advisory packaging\n- Invest in Dutch-speaking SOC analyst capacity\n- Develop joint go-to-market with hyperscaler security teams",
    change_log: "",
    assumptions: [
      "NIS2 enforcement timeline remains on track for Q4 2025 in the Netherlands",
      "Current MSS market growth rates sustain through 2027 without major economic downturn",
      "ITQ maintains current VMware/Broadcom partnership tier",
    ],
    related_research_ids: ["research-2"],
    version_ids: ["research-1"],
    origin: "human",
    agent_identity: null,
    input_context: [],
    review_status: "none",
  },

  // ---- 2. Published — Security, EU, Financial Services ----
  {
    id: "research-2",
    title: "NIS2 Impact Analysis — Financial Services",
    description:
      "Assessment of NIS2 directive implications for financial services institutions across the EU, including compliance requirements, implementation timelines, and impact on IT security procurement.",
    type: "new" as ResearchType,
    previous_version_id: null,
    cloned_from_id: null,
    cloned_changed_dimension: null,
    status: "published" as ResearchStatus,
    output_format: "factsheet" as OutputFormat,
    created_at: "2025-02-01T08:00:00Z",
    updated_at: "2025-04-10T16:00:00Z",
    published_at: "2025-04-10T16:00:00Z",
    expires_at: "2025-10-10T00:00:00Z",
    refresh_schedule: "quarterly" as RefreshSchedule,
    next_refresh_date: "2025-07-10",
    author_id: "user-2",
    reviewer_id: "user-1",
    dimensions: {
      markets: [MARKET_EU],
      domains: [DOMAIN_SEC],
      sectors: [SECTOR_FS],
    },
    tags: [
      { id: "tag-nis2", name: "NIS2", type: "system" },
      { id: "tag-dora", name: "DORA", type: "system" },
    ],
    context_documents: [],
    notebooks: [
      {
        id: "nb-2-1",
        type: "market_regulation" as NotebookType,
        research_tool: "perplexity" as ResearchTool,
        discovery_prompt:
          "Analyse the NIS2 directive requirements specifically relevant to financial services institutions in the EU.",
        analysis_prompts: [
          "How does NIS2 interact with DORA for financial services?",
          "What are the key compliance gaps for mid-size financial institutions?",
        ],
        sources: [
          {
            id: "src-2-1",
            title: "EU NIS2 Directive — Official Journal",
            url: "https://eur-lex.europa.eu/eli/dir/2022/2555",
            publisher: "European Union",
            publication_date: "2022-12-27",
            quality_tier: 1,
            discovered_by: "manual",
            notes: "Primary legislative text",
            validation_status: "unverified",
            validated_by: null,
            validated_at: null,
            validation_notes: "",
          },
        ],
        findings:
          "## NIS2 and Financial Services\n\nFinancial institutions face a dual compliance burden from both NIS2 and DORA (Digital Operational Resilience Act). While DORA takes precedence as lex specialis for the financial sector, NIS2 still applies to supporting ICT service providers.",
      },
    ],
    synthesis:
      "## NIS2 Impact Analysis — Financial Services\n\nThe intersection of NIS2 and DORA creates a complex compliance landscape for financial services. Key takeaway: financial institutions should leverage DORA as their primary framework while ensuring their ICT service providers meet NIS2 requirements.\n\n### Key Findings\n- DORA compliance deadline: January 2025\n- NIS2 transposition deadline varies by member state\n- Overlap creates both opportunities and confusion for managed service providers",
    change_log: "",
    assumptions: [
      "DORA takes precedence over NIS2 for entities directly supervised under financial services regulations",
      "Member state transposition timelines may vary by up to 12 months",
    ],
    related_research_ids: ["research-1"],
    version_ids: ["research-2"],
    origin: "human",
    agent_identity: null,
    input_context: [],
    review_status: "none",
  },

  // ---- 3. In Progress — Hybrid Cloud, Benelux ----
  {
    id: "research-3",
    title: "Benelux Hybrid Cloud Market Assessment",
    description:
      "Market assessment of hybrid cloud infrastructure adoption across the Benelux region, covering IaaS/PaaS consumption patterns, multi-cloud strategies, and the role of sovereign cloud initiatives.",
    type: "new" as ResearchType,
    previous_version_id: null,
    cloned_from_id: null,
    cloned_changed_dimension: null,
    status: "in_progress" as ResearchStatus,
    output_format: "full" as OutputFormat,
    created_at: "2025-04-01T10:00:00Z",
    updated_at: "2025-05-20T11:00:00Z",
    published_at: null,
    expires_at: null,
    refresh_schedule: "semi_annually" as RefreshSchedule,
    next_refresh_date: null,
    author_id: "user-1",
    reviewer_id: null,
    dimensions: {
      markets: [MARKET_BNL],
      domains: [DOMAIN_HC],
      sectors: [],
    },
    tags: [
      { id: "tag-cloud-native", name: "Cloud-native", type: "system" },
    ],
    context_documents: [],
    notebooks: [
      {
        id: "nb-3-1",
        type: "market_regulation" as NotebookType,
        research_tool: "notebooklm" as ResearchTool,
        discovery_prompt:
          "Map the current hybrid cloud adoption landscape in Benelux markets.",
        analysis_prompts: [
          "What percentage of Benelux enterprises operate multi-cloud environments?",
          "How are sovereign cloud requirements shaping infrastructure decisions?",
        ],
        sources: [],
        findings: "",
      },
    ],
    synthesis: "",
    change_log: "",
    assumptions: [
      "Multi-cloud adoption in Benelux follows broader Western European trends with a 6-month lag",
    ],
    related_research_ids: [],
    version_ids: ["research-3"],
    origin: "human",
    agent_identity: null,
    input_context: [],
    review_status: "none",
  },

  // ---- 4. Review — Digital Workspace, Netherlands, Education ----
  {
    id: "research-4",
    title: "Digital Workspace Modernisation — Education Sector NL",
    description:
      "Analysis of digital workspace modernisation opportunities in the Dutch education sector, examining VDI/DaaS adoption, collaboration tools deployment, and the shift toward hybrid learning infrastructure.",
    type: "new" as ResearchType,
    previous_version_id: null,
    cloned_from_id: null,
    cloned_changed_dimension: null,
    status: "review" as ResearchStatus,
    output_format: "factsheet" as OutputFormat,
    created_at: "2025-03-01T08:30:00Z",
    updated_at: "2025-05-10T09:00:00Z",
    published_at: null,
    expires_at: null,
    refresh_schedule: "semi_annually" as RefreshSchedule,
    next_refresh_date: null,
    author_id: "user-3",
    reviewer_id: "user-1",
    dimensions: {
      markets: [MARKET_NL],
      domains: [DOMAIN_DW],
      sectors: [SECTOR_EDU],
    },
    tags: [],
    context_documents: [
      {
        id: "ctx-2",
        title: "ITQ Digital Workspace Service Catalogue 2025",
        description:
          "Current DaaS and VDI service offerings from ITQ",
        category: "service_description",
        file_url: "https://storage.example.com/ctx-2.pdf",
        file_type: "pdf",
        domain_ids: ["domain-dw"],
        market_ids: ["market-nl"],
        sector_ids: ["sector-edu"],
        valid_from: "2025-01-01",
        valid_until: "2025-12-31",
        uploaded_by: "user-1",
        updated_at: "2025-01-15T10:00:00Z",
        version: 1,
        tag_ids: [],
      },
    ],
    notebooks: [],
    synthesis:
      "## Digital Workspace Modernisation — Education Sector NL (Draft)\n\nThe Dutch education sector is undergoing a significant transformation in its digital workspace infrastructure, driven by the lasting impact of hybrid learning models established during COVID-19.\n\n### Market Opportunity\n- EUR 340M addressable market for workspace services in Dutch education\n- 45% of higher education institutions plan VDI/DaaS migration by 2026\n- Strong preference for Microsoft-centric solutions (Teams, Azure Virtual Desktop)",
    change_log: "",
    assumptions: [
      "Dutch education budget allocations for IT remain stable through 2026",
      "Microsoft licensing changes do not significantly impact AVD adoption economics",
    ],
    related_research_ids: [],
    version_ids: ["research-4"],
    origin: "human",
    agent_identity: null,
    input_context: [],
    review_status: "none",
  },

  // ---- 5. Draft — AI Services, Benelux, Financial Services ----
  {
    id: "research-5",
    title: "AI Services Readiness — Financial Services Benelux",
    description:
      "Readiness assessment for AI services adoption in the Benelux financial services sector, examining regulatory readiness (EU AI Act), infrastructure requirements, and go-to-market strategies for AI consulting.",
    type: "new" as ResearchType,
    previous_version_id: null,
    cloned_from_id: null,
    cloned_changed_dimension: null,
    status: "draft" as ResearchStatus,
    output_format: "competitive" as OutputFormat,
    created_at: "2025-05-01T07:00:00Z",
    updated_at: "2025-05-15T12:00:00Z",
    published_at: null,
    expires_at: null,
    refresh_schedule: "quarterly" as RefreshSchedule,
    next_refresh_date: null,
    author_id: "user-2",
    reviewer_id: null,
    dimensions: {
      markets: [MARKET_BNL],
      domains: [DOMAIN_AI],
      sectors: [SECTOR_FS],
    },
    tags: [
      { id: "tag-eu-ai-act", name: "EU AI Act", type: "system" },
      { id: "tag-ai-ml", name: "AI/ML", type: "system" },
    ],
    context_documents: [],
    notebooks: [],
    synthesis: "",
    change_log: "",
    assumptions: [
      "EU AI Act implementation timeline holds for February 2025 prohibitions and August 2025 GPAI rules",
      "Benelux financial institutions follow ECB guidance on AI governance",
    ],
    related_research_ids: [],
    version_ids: ["research-5"],
    origin: "human",
    agent_identity: null,
    input_context: [],
    review_status: "none",
  },

  // ---- 6. Published Refresh — Security, Netherlands (refresh of research-1) ----
  {
    id: "research-6",
    title: "Dutch Managed Security Services Market 2025 — Q2 Refresh",
    description:
      "Quarterly refresh of the Dutch MSS market analysis, incorporating Q1 2025 market data, updated vendor positioning, and latest NIS2 transposition status.",
    type: "refresh" as ResearchType,
    previous_version_id: "research-1",
    cloned_from_id: null,
    cloned_changed_dimension: null,
    status: "published" as ResearchStatus,
    output_format: "full" as OutputFormat,
    created_at: "2025-06-01T08:00:00Z",
    updated_at: "2025-06-20T15:00:00Z",
    published_at: "2025-06-20T15:00:00Z",
    expires_at: "2025-12-20T00:00:00Z",
    refresh_schedule: "quarterly" as RefreshSchedule,
    next_refresh_date: "2025-09-20",
    author_id: "user-1",
    reviewer_id: "user-2",
    dimensions: {
      markets: [MARKET_NL],
      domains: [DOMAIN_SEC],
      sectors: [],
    },
    tags: [
      { id: "tag-nis2", name: "NIS2", type: "system" },
      { id: "tag-zero-trust", name: "Zero Trust", type: "system" },
    ],
    context_documents: [],
    notebooks: [
      {
        id: "nb-6-1",
        type: "market_regulation" as NotebookType,
        research_tool: "claude" as ResearchTool,
        discovery_prompt:
          "What has changed in the Dutch MSS market since Q1 2025?",
        analysis_prompts: [
          "Have there been any significant M&A events in the Dutch MSS space?",
          "What is the latest NIS2 transposition status in the Netherlands?",
        ],
        sources: [
          {
            id: "src-6-1",
            title: "Dutch Government NIS2 Implementation Progress Report",
            url: "https://www.rijksoverheid.nl/nis2-voortgang-2025",
            publisher: "Rijksoverheid",
            publication_date: "2025-05-15",
            quality_tier: 1,
            discovered_by: "manual",
            notes: "Official Dutch government NIS2 transposition status update",
            validation_status: "unverified",
            validated_by: null,
            validated_at: null,
            validation_notes: "",
          },
        ],
        findings:
          "## Q2 2025 Market Update\n\n### Key Changes\n- NIS2 transposition bill passed Dutch Parliament in April 2025\n- Two notable M&A transactions: [Vendor A] acquired [Vendor B]\n- Market growth rate revised upward to 14.1% CAGR\n\n### Updated Market Size\n- 2025 H1 run rate: EUR 980M (annualised)\n- Mid-market segment now 35% of total MSS spend",
      },
    ],
    synthesis:
      "## Q2 Refresh — Dutch MSS Market\n\nThe Q2 2025 refresh confirms accelerating market growth, now projected at **14.1% CAGR** (up from 12.4% in the initial assessment). The passage of the NIS2 transposition bill has converted latent demand into active procurement.\n\n### What Changed\n- Market growth revised upward by 1.7 percentage points\n- NIS2 transposition bill passed — compliance urgency increased\n- Two M&A transactions reshaping the vendor landscape\n\n### ITQ Action Items\n- Update MSS proposition to reference Dutch NIS2 implementation specifics\n- Reassess competitive positioning given consolidation activity",
    change_log:
      "**Q2 2025 Refresh:**\n- Updated market size and growth projections\n- Added NIS2 transposition bill passage analysis\n- Refreshed competitive landscape with M&A activity\n- Revised CAGR from 12.4% to 14.1%",
    assumptions: [
      "NIS2 Dutch implementation follows published bill without significant amendments",
      "Market growth acceleration sustained through H2 2025",
    ],
    related_research_ids: ["research-1", "research-2"],
    version_ids: ["research-1", "research-6"],
    origin: "human",
    agent_identity: null,
    input_context: [],
    review_status: "none",
  },

  // ---- 7. Clone — Security, Belgium (cloned from research-1, changed market) ----
  {
    id: "research-7",
    title: "Belgian Managed Security Services Market 2025",
    description:
      "Market analysis of managed security services in Belgium, cloned from the Dutch MSS analysis and adapted for the Belgian market context including local regulatory landscape.",
    type: "clone" as ResearchType,
    previous_version_id: null,
    cloned_from_id: "research-1",
    cloned_changed_dimension: "market",
    status: "in_progress" as ResearchStatus,
    output_format: "full" as OutputFormat,
    created_at: "2025-05-15T10:00:00Z",
    updated_at: "2025-05-28T14:00:00Z",
    published_at: null,
    expires_at: null,
    refresh_schedule: "quarterly" as RefreshSchedule,
    next_refresh_date: null,
    author_id: "user-2",
    reviewer_id: null,
    dimensions: {
      markets: [MARKET_BE],
      domains: [DOMAIN_SEC],
      sectors: [],
    },
    tags: [
      { id: "tag-nis2", name: "NIS2", type: "system" },
    ],
    context_documents: [],
    notebooks: [],
    synthesis: "",
    change_log: "",
    assumptions: [
      "Belgian MSS market structure is broadly comparable to the Netherlands with 30% smaller addressable market",
      "Belgian NIS2 transposition follows a similar timeline to the Netherlands",
    ],
    related_research_ids: ["research-1"],
    version_ids: ["research-7"],
    origin: "human",
    agent_identity: null,
    input_context: [],
    review_status: "none",
  },

  // ---- 8. Archived — Hybrid Cloud, Government, Netherlands ----
  {
    id: "research-8",
    title: "Dutch Government Cloud Adoption — 2024 Review",
    description:
      "Annual review of cloud adoption patterns within Dutch government institutions, covering compliance with BIO framework, sovereign cloud requirements, and multi-cloud strategies.",
    type: "new" as ResearchType,
    previous_version_id: null,
    cloned_from_id: null,
    cloned_changed_dimension: null,
    status: "archived" as ResearchStatus,
    output_format: "proposition" as OutputFormat,
    created_at: "2024-06-01T08:00:00Z",
    updated_at: "2024-12-15T10:00:00Z",
    published_at: "2024-09-01T10:00:00Z",
    expires_at: "2025-03-01T00:00:00Z",
    refresh_schedule: "semi_annually" as RefreshSchedule,
    next_refresh_date: null,
    author_id: "user-3",
    reviewer_id: "user-1",
    dimensions: {
      markets: [MARKET_NL],
      domains: [DOMAIN_HC],
      sectors: [SECTOR_GOV],
    },
    tags: [
      { id: "tag-cloud-native", name: "Cloud-native", type: "system" },
    ],
    context_documents: [],
    notebooks: [],
    synthesis:
      "## Dutch Government Cloud Adoption — 2024 Review\n\nCloud adoption within Dutch government institutions continues to accelerate, though sovereign cloud requirements and BIO compliance create unique constraints.\n\n### Key Findings\n- 62% of central government IT workloads now cloud-hosted\n- Azure Government and AWS GovCloud are preferred platforms\n- BIO compliance remains the primary procurement gate",
    change_log: "",
    assumptions: [],
    related_research_ids: [],
    version_ids: ["research-8"],
    origin: "human",
    agent_identity: null,
    input_context: [],
    review_status: "none",
  },
];

// ---------------------------------------------------------------------------
// Helper: find research by ID
// ---------------------------------------------------------------------------

export function getResearchById(id: string): Research | undefined {
  return MOCK_RESEARCH.find((r) => r.id === id);
}

// ---------------------------------------------------------------------------
// Author display names (simple lookup for mock data)
// ---------------------------------------------------------------------------

export const MOCK_AUTHORS: Record<string, string> = {
  "user-1": "Joris van den Berg",
  "user-2": "Marloes de Vries",
  "user-3": "Thomas Bakker",
};
