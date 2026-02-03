/**
 * Sector seed data for the ITQ Market Intelligence Portal.
 * Sectors represent vertical industries that ITQ serves, each with
 * relevant regulatory frameworks affecting cybersecurity and IT services.
 */

import type { Sector } from "@/types";

export const SECTORS: Sector[] = [
  {
    id: "sector-hc",
    name: "Healthcare",
    code: "HC",
    relevant_regulations: ["NIS2", "GDPR", "Medical Device Regulation"],
  },
  {
    id: "sector-fs",
    name: "Financial Services",
    code: "FS",
    relevant_regulations: ["DORA", "NIS2", "GDPR", "PSD2"],
  },
  {
    id: "sector-gov",
    name: "Government",
    code: "GOV",
    relevant_regulations: [
      "NIS2",
      "GDPR",
      "Baseline Informatiebeveiliging Overheid (BIO)",
    ],
  },
  {
    id: "sector-mfg",
    name: "Manufacturing",
    code: "MFG",
    relevant_regulations: ["NIS2", "Cyber Resilience Act", "GDPR"],
  },
  {
    id: "sector-edu",
    name: "Education",
    code: "EDU",
    relevant_regulations: ["GDPR", "NIS2"],
  },
  {
    id: "sector-ret",
    name: "Retail",
    code: "RET",
    relevant_regulations: ["PCI DSS", "GDPR", "NIS2"],
  },
  {
    id: "sector-enu",
    name: "Energy & Utilities",
    code: "ENU",
    relevant_regulations: [
      "NIS2",
      "GDPR",
      "Network Code on Cybersecurity",
    ],
  },
];

/**
 * Retrieve a sector by its ID.
 */
export function getSectorById(id: string): Sector | undefined {
  return SECTORS.find((sector) => sector.id === id);
}

/**
 * Retrieve a sector by its code.
 */
export function getSectorByCode(code: string): Sector | undefined {
  return SECTORS.find((sector) => sector.code === code);
}

/**
 * Get all sectors that are affected by a given regulation.
 */
export function getSectorsByRegulation(regulation: string): Sector[] {
  return SECTORS.filter((sector) =>
    sector.relevant_regulations.includes(regulation)
  );
}
