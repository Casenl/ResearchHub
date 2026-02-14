/**
 * Mock legislation entries for the ITQ Market Intelligence Portal.
 * Used during development to populate the Legislation admin UI.
 */

import type { Legislation } from "@/types";

export const MOCK_LEGISLATION: Legislation[] = [
  {
    id: "leg-1",
    name: "NEN 7510",
    description:
      "Dutch standard for information security in healthcare. Specifies requirements for an information security management system (ISMS) tailored to healthcare organizations.",
    market_ids: ["market-nl"],
    sector_ids: ["sector-hc"],
    scope: "national",
    effective_date: "2017-12-01",
    enforcement_authority: "Dutch Healthcare Inspectorate (IGJ)",
    compliance_deadline: null,
    context_document_id: null,
    url: "https://www.nen.nl/nen-7510-1-2017-nl-245399",
    tags: ["healthcare", "information-security", "isms"],
    created_by: "user-1",
    created_at: "2025-10-01T09:00:00Z",
    updated_at: "2025-10-01T09:00:00Z",
  },
  {
    id: "leg-2",
    name: "Wbni (Wet beveiliging netwerk- en informatiesystemen)",
    description:
      "Dutch implementation of the EU NIS Directive. Imposes security and incident reporting obligations on essential service operators and digital service providers.",
    market_ids: ["market-nl"],
    sector_ids: ["sector-hc", "sector-fs", "sector-enu"],
    scope: "national",
    effective_date: "2018-11-09",
    enforcement_authority: "NCSC / Agentschap Telecom",
    compliance_deadline: null,
    context_document_id: null,
    url: "https://wetten.overheid.nl/BWBR0041515/2018-11-09",
    tags: ["nis", "network-security", "incident-reporting"],
    created_by: "user-1",
    created_at: "2025-10-05T10:00:00Z",
    updated_at: "2025-10-05T10:00:00Z",
  },
  {
    id: "leg-3",
    name: "BSI IT-Grundschutz",
    description:
      "German federal methodology for IT security management maintained by the Federal Office for Information Security (BSI). Mandatory for federal agencies, widely adopted by critical infrastructure operators.",
    market_ids: ["market-de"],
    sector_ids: ["sector-gov"],
    scope: "national",
    effective_date: "2017-10-01",
    enforcement_authority: "Bundesamt für Sicherheit in der Informationstechnik (BSI)",
    compliance_deadline: null,
    context_document_id: null,
    url: "https://www.bsi.bund.de/EN/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/IT-Grundschutz/it-grundschutz_node.html",
    tags: ["government", "it-security", "bsi"],
    created_by: "user-1",
    created_at: "2025-10-10T08:00:00Z",
    updated_at: "2025-10-10T08:00:00Z",
  },
  {
    id: "leg-4",
    name: "DORA (Digital Operational Resilience Act)",
    description:
      "EU regulation on digital operational resilience for the financial sector. Establishes uniform requirements for ICT risk management, incident reporting, digital operational resilience testing, and third-party risk management.",
    market_ids: ["market-nl", "market-de", "market-fr", "market-uk"],
    sector_ids: ["sector-fs"],
    scope: "eu",
    effective_date: "2023-01-16",
    enforcement_authority: "European Supervisory Authorities (EBA, ESMA, EIOPA)",
    compliance_deadline: "2025-01-17",
    context_document_id: null,
    url: "https://eur-lex.europa.eu/eli/reg/2022/2554",
    tags: ["financial-services", "ict-risk", "resilience"],
    created_by: "user-1",
    created_at: "2025-11-01T12:00:00Z",
    updated_at: "2025-11-01T12:00:00Z",
  },
  {
    id: "leg-5",
    name: "Basel III",
    description:
      "International regulatory framework for banks developed by the Basel Committee on Banking Supervision. Strengthens capital requirements, leverage ratios, and liquidity standards.",
    market_ids: ["market-nl", "market-de", "market-fr", "market-uk"],
    sector_ids: ["sector-fs"],
    scope: "international",
    effective_date: "2023-01-01",
    enforcement_authority: "Basel Committee on Banking Supervision (BCBS)",
    compliance_deadline: "2028-01-01",
    context_document_id: null,
    url: "https://www.bis.org/bcbs/basel3.htm",
    tags: ["banking", "capital-requirements", "liquidity"],
    created_by: "user-1",
    created_at: "2025-11-15T14:00:00Z",
    updated_at: "2025-11-15T14:00:00Z",
  },
];
