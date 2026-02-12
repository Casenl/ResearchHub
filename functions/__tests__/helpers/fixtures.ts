import { createHash } from 'crypto';

// ---------------------------------------------------------------------------
// Pre-defined API keys for tests
// ---------------------------------------------------------------------------

export const TEST_KEYS = {
  admin: 'test-admin-key-123',
  read_write: 'test-rw-key-123',
  read: 'test-read-key-123',
} as const;

export function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

const AGENT_IDENTITY = {
  admin: {
    agent_id: 'agent-001',
    agent_name: 'Test Admin Agent',
    agent_version: '1.0.0',
    run_id: 'run-001',
  },
  read_write: {
    agent_id: 'agent-002',
    agent_name: 'Test RW Agent',
    agent_version: '1.0.0',
    run_id: 'run-002',
  },
  read: {
    agent_id: 'agent-003',
    agent_name: 'Test Read Agent',
    agent_version: '1.0.0',
    run_id: 'run-003',
  },
} as const;

export const API_KEY_DOCS: Record<string, Record<string, unknown>> = {
  'key-admin': {
    name: 'Admin Key',
    key_hash: hashKey(TEST_KEYS.admin),
    permissions: 'admin',
    is_active: true,
    expires_at: null,
    agent_identity: { ...AGENT_IDENTITY.admin },
    created_by: 'system',
    created_at: '2025-01-01T00:00:00.000Z',
    last_used_at: null,
  },
  'key-rw': {
    name: 'Read-Write Key',
    key_hash: hashKey(TEST_KEYS.read_write),
    permissions: 'read_write',
    is_active: true,
    expires_at: null,
    agent_identity: { ...AGENT_IDENTITY.read_write },
    created_by: 'system',
    created_at: '2025-01-01T00:00:00.000Z',
    last_used_at: null,
  },
  'key-read': {
    name: 'Read Key',
    key_hash: hashKey(TEST_KEYS.read),
    permissions: 'read',
    is_active: true,
    expires_at: null,
    agent_identity: { ...AGENT_IDENTITY.read },
    created_by: 'system',
    created_at: '2025-01-01T00:00:00.000Z',
    last_used_at: null,
  },
};

// ---------------------------------------------------------------------------
// Valid request payloads
// ---------------------------------------------------------------------------

export const VALID_RESEARCH_PAYLOAD = {
  title: 'Test Research',
  description: 'A test research document',
  type: 'new' as const,
  output_format: 'factsheet' as const,
  refresh_schedule: 'ad_hoc' as const,
  origin: 'agent' as const,
  agent_identity: { ...AGENT_IDENTITY.admin },
  dimensions: {
    market_ids: ['nl'],
    domain_ids: ['cloud'],
    sector_ids: ['finance'],
  },
  findings: '',
  synthesis: '',
  assumptions: [],
  input_context: [],
  tag_ids: [],
  context_document_ids: [],
};

export const VALID_SOURCE_PAYLOAD = {
  notebook_id: 'nb-1',
  title: 'Test Source',
  url: 'https://example.com/source',
  publisher: 'Test Publisher',
  publication_date: '2025-01-01',
  quality_tier: 4,
  discovered_by: 'claude' as const,
  notes: 'Test notes',
};

export const VALID_FILE_PAYLOAD = {
  file_name: 'test.pdf',
  file_type: 'application/pdf',
  file_data: Buffer.from('%PDF-1.4 test content').toString('base64'),
  source_id: null,
};

export const VALID_API_KEY_PAYLOAD = {
  name: 'New Test Key',
  permissions: 'read_write' as const,
  agent_identity: {
    agent_id: 'agent-new',
    agent_name: 'New Agent',
    agent_version: '2.0.0',
    run_id: 'run-new',
  },
  expires_at: null,
};

// ---------------------------------------------------------------------------
// Pre-seeded research document
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
    author_id: 'agent-001',
    dimensions: {
      markets: ['nl'],
      domains: ['cloud'],
      sectors: ['finance'],
    },
    notebooks: [
      {
        id: 'nb-1',
        type: 'competitive',
        sources: [
          {
            id: 'src-1',
            title: 'Existing Source',
            url: 'https://example.com/existing',
            publisher: 'Publisher A',
            quality_tier: 4,
            discovered_by: 'claude',
            validation_status: 'unverified',
            validated_by: null,
            validated_at: null,
            validation_notes: '',
          },
        ],
        findings: '',
      },
    ],
    findings: '',
    synthesis: 'Test synthesis',
    assumptions: [],
    tags: [],
    context_documents: [],
    input_context: [],
    related_research_ids: [],
    version_ids: [],
    agent_identity: {
      agent_id: 'agent-001',
      agent_name: 'Test Agent',
      agent_version: '1.0.0',
      run_id: 'run-001',
    },
    review_status: 'pending',
    change_log: '',
  },
};

// ---------------------------------------------------------------------------
// Intelligence-shaped research (dimension objects, not string arrays)
// ---------------------------------------------------------------------------

export const INTELLIGENCE_RESEARCH: Record<string, Record<string, unknown>> = {
  'intel-1': {
    title: 'Intel Research NL Cloud',
    description: 'Intelligence test research',
    status: 'published',
    origin: 'agent',
    synthesis: 'Cloud computing is growing in NL.',
    updated_at: '2025-06-01T00:00:00.000Z',
    dimensions: {
      markets: [{ id: 'nl', name: 'Netherlands', code: 'NL' }],
      domains: [{ id: 'cloud', name: 'Cloud', code: 'CLOUD' }],
      sectors: [{ id: 'finance', name: 'Finance', code: 'FIN' }],
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
    title: 'Intel Research NL Security',
    description: 'Intelligence test research 2',
    status: 'draft',
    origin: 'human',
    synthesis: 'Security regulations tightening.',
    updated_at: '2025-07-01T00:00:00.000Z',
    dimensions: {
      markets: [{ id: 'nl', name: 'Netherlands', code: 'NL' }],
      domains: [{ id: 'security', name: 'Security', code: 'SEC' }],
      sectors: [],
    },
    notebooks: [],
  },
  'intel-archived': {
    title: 'Archived Research',
    description: 'Should be excluded',
    status: 'archived',
    origin: 'agent',
    synthesis: '',
    updated_at: '2025-01-01T00:00:00.000Z',
    dimensions: {
      markets: [{ id: 'nl', name: 'Netherlands', code: 'NL' }],
      domains: [],
      sectors: [],
    },
    notebooks: [],
  },
};
