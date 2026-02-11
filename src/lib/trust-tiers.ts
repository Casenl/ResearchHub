// =============================================================================
// Trust Tier System — Source quality classification for research platform
// =============================================================================

import type {
  QualityTier,
  TrustTierClassification,
  ValidationStatus,
  ResearchTool,
} from '@/types';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface TrustTierDefinition {
  tier: QualityTier;
  classification: TrustTierClassification;
  label: string;
  description: string;
  examples: string[];
}

// -----------------------------------------------------------------------------
// Definitions
// -----------------------------------------------------------------------------

export const TRUST_TIER_DEFINITIONS: TrustTierDefinition[] = [
  {
    tier: 1,
    classification: 'authoritative',
    label: 'Government & EU Institutional',
    description: 'Official government reports, EU regulations, institutional publications',
    examples: ['European Commission reports', 'CBS/Eurostat data', 'National gazette publications'],
  },
  {
    tier: 2,
    classification: 'authoritative',
    label: 'Independent Annual Reports',
    description: 'Peer-reviewed publications, independent indices, company filings',
    examples: ['Annual reports (KvK filings)', 'Academic journals', 'Independent market indices'],
  },
  {
    tier: 3,
    classification: 'established',
    label: 'Analyst Houses',
    description: 'Major analyst firms with established methodologies',
    examples: ['Gartner Magic Quadrant', 'Forrester Wave', 'IDC MarketScape'],
  },
  {
    tier: 4,
    classification: 'established',
    label: 'Knowledge Institutes & Trade Press',
    description: 'Established trade press and knowledge institutes',
    examples: ['Computable', 'AG Connect', 'MSP-focused publications'],
  },
  {
    tier: 5,
    classification: 'standard',
    label: 'Peer-Reviewed Industry Research',
    description: 'Industry research with editorial review',
    examples: ['Channel research reports', 'Partner ecosystem analyses'],
  },
  {
    tier: 6,
    classification: 'standard',
    label: 'AI-Synthesized Research',
    description: 'AI tool outputs from reputable search/synthesis tools',
    examples: ['Perplexity search results', 'NotebookLM synthesis', 'Claude analysis'],
  },
  {
    tier: 7,
    classification: 'unverified',
    label: 'Vendor Research',
    description: 'Vendor-published technical content',
    examples: ['Vendor white papers', 'Technical documentation', 'Vendor case studies'],
  },
  {
    tier: 8,
    classification: 'unverified',
    label: 'Vendor Marketing',
    description: 'Marketing materials and single-source claims',
    examples: ['Vendor brochures', 'Press releases', 'Unverified forum posts'],
  },
];

// -----------------------------------------------------------------------------
// Lookup functions
// -----------------------------------------------------------------------------

const TOOL_DEFAULT_TIERS: Record<ResearchTool, QualityTier> = {
  manual: 4,
  notebooklm: 6,
  perplexity: 6,
  claude: 6,
};

export function getDefaultTierForTool(tool: ResearchTool): QualityTier {
  return TOOL_DEFAULT_TIERS[tool];
}

export function getClassificationForTier(tier: QualityTier): TrustTierClassification {
  if (tier <= 2) return 'authoritative';
  if (tier <= 4) return 'established';
  if (tier <= 6) return 'standard';
  return 'unverified';
}

export function calculateTierAdjustment(
  currentTier: QualityTier,
  validationStatus: ValidationStatus,
): QualityTier {
  switch (validationStatus) {
    case 'corroborated':
      return Math.max(1, currentTier - 1) as QualityTier;
    case 'human_verified':
      return Math.max(1, currentTier - 2) as QualityTier;
    case 'disputed':
      return Math.min(8, currentTier + 2) as QualityTier;
    case 'unverified':
      return currentTier;
  }
}

export function getTierDefinition(tier: QualityTier): TrustTierDefinition {
  return TRUST_TIER_DEFINITIONS[tier - 1];
}
