/**
 * Domain seed data for the ITQ Market Intelligence Portal.
 * Domains represent the core service areas / technology domains covered by ITQ research.
 */

import type { Domain } from "@/types";

export const DOMAINS: Domain[] = [
  {
    id: "domain-sec",
    name: "Security",
    code: "SEC",
    description:
      "Managed security services, SOC, MDR, vulnerability management, identity & access",
    default_sources: [
      "ENISA MSS Market Analysis",
      "NCSC Annual Review",
      "Verizon DBIR",
      "SANS Institute",
      "ISACA",
      "CrowdStrike Global Threat Report",
      "Gartner Market Guide MDR",
    ],
    itq_service_catalogue_ref: "SC-SEC-001",
  },
  {
    id: "domain-hc",
    name: "Hybrid Cloud",
    code: "HC",
    description:
      "Cloud infrastructure, multi-cloud management, cloud migration, IaaS/PaaS",
    default_sources: [
      "Gartner MQ IaaS/PaaS",
      "Flexera State of the Cloud",
      "IDC Cloud Tracker",
      "Uptime Institute",
      "CISPE Reports",
    ],
    itq_service_catalogue_ref: "SC-HC-001",
  },
  {
    id: "domain-dw",
    name: "Digital Workspace",
    code: "DW",
    description:
      "End-user computing, VDI, DaaS, UEM, collaboration tools",
    default_sources: [
      "Gartner MQ UEM/VDI/DaaS",
      "Forrester EUC Wave",
      "Microsoft/VMware/Citrix Adoption Reports",
    ],
    itq_service_catalogue_ref: "SC-DW-001",
  },
  {
    id: "domain-ai",
    name: "AI Services",
    code: "AI",
    description:
      "AI/ML services, AI infrastructure, AI strategy consulting",
    default_sources: [
      "Stanford AI Index",
      "McKinsey State of AI",
      "EU AI Act Impact Analyses",
      "OECD AI Policy Observatory",
    ],
    itq_service_catalogue_ref: "SC-AI-001",
  },
];

/**
 * Retrieve a domain by its ID.
 */
export function getDomainById(id: string): Domain | undefined {
  return DOMAINS.find((domain) => domain.id === id);
}

/**
 * Retrieve a domain by its code.
 */
export function getDomainByCode(code: string): Domain | undefined {
  return DOMAINS.find((domain) => domain.code === code);
}
