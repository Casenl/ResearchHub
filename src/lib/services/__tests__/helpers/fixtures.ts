/**
 * Test fixtures for MCP service layer tests.
 * Uses real taxonomy IDs from src/data/ to verify dimension resolution.
 */

import type { Source } from '@/types';

// ---------------------------------------------------------------------------
// Agent identity
// ---------------------------------------------------------------------------

export const AGENT_IDENTITY = {
  agent_id: 'agent-mcp-test',
  agent_name: 'MCP Test Agent',
  agent_version: '1.0.0',
  run_id: 'run-mcp-001',
};

// ---------------------------------------------------------------------------
// Valid create payloads
// ---------------------------------------------------------------------------

/** Uses real taxonomy IDs that exist in src/data/markets.ts etc. */
export const VALID_CREATE_PAYLOAD = {
  title: 'Netherlands Security Research',
  description: 'Security landscape in the Netherlands financial sector',
  type: 'new' as const,
  output_format: 'factsheet' as const,
  refresh_schedule: 'ad_hoc' as const,
  origin: 'agent' as const,
  agent_identity: { ...AGENT_IDENTITY },
  dimensions: {
    market_ids: ['market-nl'],
    domain_ids: ['domain-sec'],
    sector_ids: ['sector-fs'],
  },
  findings: '',
  synthesis: '',
  assumptions: [],
  input_context: [],
  tag_ids: [],
  context_document_ids: [],
};

/** Payload with IDs that don't exist in taxonomy data. */
export const CREATE_PAYLOAD_UNKNOWN_IDS = {
  ...VALID_CREATE_PAYLOAD,
  dimensions: {
    market_ids: ['market-nl', 'market-nonexistent'],
    domain_ids: ['domain-sec', 'domain-fake'],
    sector_ids: ['sector-fs', 'sector-xyz'],
  },
};

/** Human-origin payload (review_status should be 'none'). */
export const HUMAN_CREATE_PAYLOAD = {
  ...VALID_CREATE_PAYLOAD,
  origin: 'human' as const,
  agent_identity: null,
};

// ---------------------------------------------------------------------------
// Valid source payloads
// ---------------------------------------------------------------------------

export const VALID_SOURCE_PAYLOAD = {
  title: 'ENISA Threat Landscape 2025',
  url: 'https://www.enisa.europa.eu/publications/enisa-threat-landscape-2025',
  publisher: 'ENISA',
  publication_date: '2025-06-15',
  quality_tier: 2 as const,
  discovered_by: 'manual' as const,
  notes: 'Annual ENISA threat report',
};

export function makeSourcePayload(overrides: Partial<typeof VALID_SOURCE_PAYLOAD> = {}) {
  return { ...VALID_SOURCE_PAYLOAD, ...overrides };
}

// ---------------------------------------------------------------------------
// Valid file payloads
// ---------------------------------------------------------------------------

/** Real PDF magic bytes: %PDF-1.4 */
export const PDF_BUFFER = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x20, 0x74, 0x65, 0x73, 0x74]);

/** Real DOCX/ZIP magic bytes: PK\x03\x04 */
export const DOCX_BUFFER = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00]);

/** Fake PDF (wrong magic bytes). */
export const FAKE_PDF_BUFFER = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]);

export const VALID_FILE_PARAMS = {
  research_id: 'research-1',
  file_name: 'report.pdf',
  file_type: 'application/pdf',
  file_buffer: PDF_BUFFER,
  uploaded_by: 'agent-mcp-test',
  origin: 'agent' as const,
  source_id: null,
};

// ---------------------------------------------------------------------------
// Seeded research (pre-populated in mock store)
// ---------------------------------------------------------------------------

export const SEEDED_RESEARCH: Record<string, Record<string, unknown>> = {
  'research-1': {
    title: 'Netherlands Cloud Research',
    description: 'Cloud computing landscape in the Netherlands',
    type: 'new',
    output_format: 'factsheet',
    refresh_schedule: 'quarterly',
    status: 'draft',
    origin: 'agent',
    created_at: '2025-01-15T10:00:00.000Z',
    updated_at: '2025-01-15T10:00:00.000Z',
    published_at: null,
    expires_at: null,
    next_refresh_date: null,
    author_id: 'agent-001',
    reviewer_id: null,
    dimensions: {
      markets: [{ id: 'market-nl', name: 'Netherlands', code: 'NL', parent_id: 'market-bnl' }],
      domains: [{ id: 'domain-hc', name: 'Hybrid Cloud', code: 'HC' }],
      sectors: [{ id: 'sector-fs', name: 'Financial Services', code: 'FS' }],
    },
    notebooks: [
      {
        id: 'nb-1',
        type: 'competitive',
        sources: [
          {
            id: 'src-existing',
            title: 'Existing Source',
            url: 'https://example.com/existing',
            publisher: 'Publisher A',
            publication_date: '2025-01-01',
            quality_tier: 4,
            discovered_by: 'claude',
            notes: '',
            validation_status: 'unverified',
            validated_by: null,
            validated_at: null,
            validation_notes: '',
          } satisfies Source,
        ],
        findings: '',
      },
    ],
    findings: '',
    synthesis: 'Test synthesis content',
    change_log: '',
    assumptions: [],
    tags: [],
    context_documents: [],
    related_research_ids: [],
    version_ids: [],
    input_context: [],
    agent_identity: { ...AGENT_IDENTITY },
    review_status: 'pending',
    previous_version_id: null,
    cloned_from_id: null,
    cloned_changed_dimension: null,
  },
};

// ---------------------------------------------------------------------------
// Intelligence-shaped research (for queryResearch / getLandscape / getBrief)
// ---------------------------------------------------------------------------

export const INTELLIGENCE_RESEARCH: Record<string, Record<string, unknown>> = {
  'intel-1': {
    title: 'Intel NL Cloud Published',
    description: 'Published cloud research',
    status: 'published',
    origin: 'agent',
    synthesis: 'Cloud computing is growing in NL.',
    updated_at: '2025-06-01T00:00:00.000Z',
    dimensions: {
      markets: [{ id: 'market-nl', name: 'Netherlands', code: 'NL' }],
      domains: [{ id: 'domain-hc', name: 'Hybrid Cloud', code: 'HC' }],
      sectors: [{ id: 'sector-fs', name: 'Financial Services', code: 'FS' }],
    },
    notebooks: [
      {
        id: 'nb-1',
        type: 'competitive',
        sources: [
          { id: 'src-1', title: 'Source 1', quality_tier: 3 },
          { id: 'src-2', title: 'Source 2', quality_tier: 5 },
        ],
        findings: 'Some findings',
      },
    ],
  },
  'intel-2': {
    title: 'Intel NL Security Draft',
    description: 'Draft security research',
    status: 'draft',
    origin: 'human',
    synthesis: 'Security regulations tightening.',
    updated_at: '2025-07-01T00:00:00.000Z',
    dimensions: {
      markets: [{ id: 'market-nl', name: 'Netherlands', code: 'NL' }],
      domains: [{ id: 'domain-sec', name: 'Security', code: 'SEC' }],
      sectors: [],
    },
    notebooks: [],
  },
  'intel-3': {
    title: 'Intel BE Cloud Published',
    description: 'Belgium cloud research',
    status: 'published',
    origin: 'agent',
    synthesis: 'Belgium cloud adoption increasing.',
    updated_at: '2025-05-01T00:00:00.000Z',
    dimensions: {
      markets: [{ id: 'market-be', name: 'Belgium', code: 'BE' }],
      domains: [{ id: 'domain-hc', name: 'Hybrid Cloud', code: 'HC' }],
      sectors: [],
    },
    notebooks: [
      {
        id: 'nb-1',
        type: 'competitive',
        sources: [{ id: 'src-3', title: 'Source 3', quality_tier: 6 }],
        findings: 'Belgium findings',
      },
    ],
  },
  'intel-archived': {
    title: 'Archived Research',
    description: 'Should be excluded from most queries',
    status: 'archived',
    origin: 'agent',
    synthesis: '',
    updated_at: '2025-01-01T00:00:00.000Z',
    dimensions: {
      markets: [{ id: 'market-nl', name: 'Netherlands', code: 'NL' }],
      domains: [],
      sectors: [],
    },
    notebooks: [],
  },
};
