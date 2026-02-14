import { describe, it, expect } from 'vitest';
import {
  CreateResearchSchema,
  UpdateResearchSchema,
  QueryResearchSchema,
  DocumentIdSchema,
  CreateSourceSchema,
  ValidateSourceSchema,
  UploadFileSchema,
  CreateLegislationSchema,
  UpdateLegislationSchema,
  QueryLegislationSchema,
} from '@/lib/validations';

// -----------------------------------------------------------------------------
// CreateResearchSchema
// -----------------------------------------------------------------------------

describe('CreateResearchSchema', () => {
  const validPayload = {
    title: 'Dutch Cloud Market Research',
    output_format: 'factsheet' as const,
    origin: 'human' as const,
    dimensions: {
      market_ids: ['nl'],
      domain_ids: ['cloud'],
      sector_ids: ['healthcare'],
    },
  };

  it('accepts a valid payload with required fields', () => {
    const result = CreateResearchSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('applies default values', () => {
    const result = CreateResearchSchema.parse(validPayload);
    expect(result.type).toBe('new');
    expect(result.refresh_schedule).toBe('ad_hoc');
    expect(result.description).toBe('');
    expect(result.tag_ids).toEqual([]);
    expect(result.context_document_ids).toEqual([]);
  });

  it('rejects empty title', () => {
    const result = CreateResearchSchema.safeParse({
      ...validPayload,
      title: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects title over 200 characters', () => {
    const result = CreateResearchSchema.safeParse({
      ...validPayload,
      title: 'a'.repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing output_format', () => {
    const { output_format: _output_format, ...incomplete } = validPayload;
    const result = CreateResearchSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('rejects invalid origin value', () => {
    const result = CreateResearchSchema.safeParse({
      ...validPayload,
      origin: 'bot',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing dimensions', () => {
    const { dimensions: _dimensions, ...incomplete } = validPayload;
    const result = CreateResearchSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });
});

// -----------------------------------------------------------------------------
// UpdateResearchSchema
// -----------------------------------------------------------------------------

describe('UpdateResearchSchema', () => {
  it('accepts partial update with just title', () => {
    const result = UpdateResearchSchema.safeParse({ title: 'Updated Title' });
    expect(result.success).toBe(true);
  });

  it('accepts empty object (all fields optional)', () => {
    const result = UpdateResearchSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects empty string title', () => {
    const result = UpdateResearchSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });

  it('strips status field (status changes go through workflow transitions)', () => {
    const result = UpdateResearchSchema.safeParse({ status: 'published', title: 'Test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('status');
      expect(result.data.title).toBe('Test');
    }
  });
});

// -----------------------------------------------------------------------------
// QueryResearchSchema
// -----------------------------------------------------------------------------

describe('QueryResearchSchema', () => {
  it('accepts empty object and applies defaults', () => {
    const result = QueryResearchSchema.parse({});
    expect(result.limit).toBe(20);
    expect(result.offset).toBe(0);
  });

  it('accepts all filters', () => {
    const result = QueryResearchSchema.safeParse({
      status: 'published',
      output_format: 'full',
      origin: 'agent',
      market_id: 'nl',
      domain_id: 'cloud',
      sector_id: 'healthcare',
      min_trust_tier: 3,
      limit: 50,
      offset: 10,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative offset', () => {
    const result = QueryResearchSchema.safeParse({ offset: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects limit greater than 100', () => {
    const result = QueryResearchSchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it('rejects min_trust_tier greater than 8', () => {
    const result = QueryResearchSchema.safeParse({ min_trust_tier: 9 });
    expect(result.success).toBe(false);
  });
});

// -----------------------------------------------------------------------------
// CreateSourceSchema
// -----------------------------------------------------------------------------

describe('CreateSourceSchema', () => {
  const validSource = {
    title: 'Gartner Magic Quadrant 2025',
    url: 'https://gartner.com/report/mq-2025',
    publisher: 'Gartner',
    quality_tier: 3,
    discovered_by: 'manual' as const,
  };

  it('accepts valid source with URL, publisher, tier, discovered_by', () => {
    const result = CreateSourceSchema.safeParse(validSource);
    expect(result.success).toBe(true);
  });

  it('rejects missing url', () => {
    const { url: _url, ...incomplete } = validSource;
    const result = CreateSourceSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('rejects invalid URL format', () => {
    const result = CreateSourceSchema.safeParse({
      ...validSource,
      url: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('rejects tier 0', () => {
    const result = CreateSourceSchema.safeParse({
      ...validSource,
      quality_tier: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects tier 9', () => {
    const result = CreateSourceSchema.safeParse({
      ...validSource,
      quality_tier: 9,
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown tool', () => {
    const result = CreateSourceSchema.safeParse({
      ...validSource,
      discovered_by: 'google',
    });
    expect(result.success).toBe(false);
  });
});

// -----------------------------------------------------------------------------
// ValidateSourceSchema
// -----------------------------------------------------------------------------

describe('ValidateSourceSchema', () => {
  it('accepts corroborated status', () => {
    const result = ValidateSourceSchema.safeParse({
      validation_status: 'corroborated',
    });
    expect(result.success).toBe(true);
  });

  it('accepts human_verified status', () => {
    const result = ValidateSourceSchema.safeParse({
      validation_status: 'human_verified',
    });
    expect(result.success).toBe(true);
  });

  it('accepts disputed status', () => {
    const result = ValidateSourceSchema.safeParse({
      validation_status: 'disputed',
    });
    expect(result.success).toBe(true);
  });

  it('accepts unverified status', () => {
    const result = ValidateSourceSchema.safeParse({
      validation_status: 'unverified',
    });
    expect(result.success).toBe(true);
  });

  it('rejects unknown status', () => {
    const result = ValidateSourceSchema.safeParse({
      validation_status: 'confirmed',
    });
    expect(result.success).toBe(false);
  });
});

// -----------------------------------------------------------------------------
// UploadFileSchema
// -----------------------------------------------------------------------------

describe('UploadFileSchema', () => {
  const validFile = {
    file_name: 'report.pdf',
    file_type: 'application/pdf' as const,
    size_bytes: 1024,
  };

  it('accepts valid file with allowed MIME type', () => {
    const result = UploadFileSchema.safeParse(validFile);
    expect(result.success).toBe(true);
  });

  it('rejects disallowed MIME type', () => {
    const result = UploadFileSchema.safeParse({
      ...validFile,
      file_type: 'application/exe',
    });
    expect(result.success).toBe(false);
  });

  it('rejects file size exceeding 50MB', () => {
    const result = UploadFileSchema.safeParse({
      ...validFile,
      size_bytes: 50 * 1024 * 1024 + 1,
    });
    expect(result.success).toBe(false);
  });

  it('accepts null source_id', () => {
    const result = UploadFileSchema.parse({
      ...validFile,
      source_id: null,
    });
    expect(result.source_id).toBeNull();
  });
});

// -----------------------------------------------------------------------------
// DocumentIdSchema
// -----------------------------------------------------------------------------

describe('DocumentIdSchema', () => {
  it('accepts valid alphanumeric IDs', () => {
    expect(DocumentIdSchema.safeParse('research-1').success).toBe(true);
    expect(DocumentIdSchema.safeParse('abc_123-XYZ').success).toBe(true);
    expect(DocumentIdSchema.safeParse('a').success).toBe(true);
  });

  it('rejects empty string', () => {
    expect(DocumentIdSchema.safeParse('').success).toBe(false);
  });

  it('rejects path traversal attempts', () => {
    expect(DocumentIdSchema.safeParse('../evil').success).toBe(false);
    expect(DocumentIdSchema.safeParse('foo/bar').success).toBe(false);
    expect(DocumentIdSchema.safeParse('foo\\bar').success).toBe(false);
  });

  it('rejects special characters', () => {
    expect(DocumentIdSchema.safeParse('id with spaces').success).toBe(false);
    expect(DocumentIdSchema.safeParse('id<script>').success).toBe(false);
    expect(DocumentIdSchema.safeParse('id;DROP TABLE').success).toBe(false);
  });

  it('rejects IDs exceeding max length', () => {
    expect(DocumentIdSchema.safeParse('a'.repeat(1501)).success).toBe(false);
  });
});

// -----------------------------------------------------------------------------
// CreateSourceSchema — ISO date validation
// -----------------------------------------------------------------------------

describe('CreateSourceSchema — date validation', () => {
  const baseSource = {
    title: 'Source Title',
    url: 'https://example.com',
    publisher: 'Publisher',
    quality_tier: 3,
    discovered_by: 'manual' as const,
  };

  it('accepts valid ISO date', () => {
    const result = CreateSourceSchema.safeParse({
      ...baseSource,
      publication_date: '2025-01-15',
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid ISO datetime', () => {
    const result = CreateSourceSchema.safeParse({
      ...baseSource,
      publication_date: '2025-01-15T10:30:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty string (unknown date)', () => {
    const result = CreateSourceSchema.safeParse({
      ...baseSource,
      publication_date: '',
    });
    expect(result.success).toBe(true);
  });

  it('defaults to empty string when omitted', () => {
    const result = CreateSourceSchema.parse(baseSource);
    expect(result.publication_date).toBe('');
  });

  it('rejects invalid date string', () => {
    const result = CreateSourceSchema.safeParse({
      ...baseSource,
      publication_date: 'banana',
    });
    expect(result.success).toBe(false);
  });

  it('rejects partial date', () => {
    const result = CreateSourceSchema.safeParse({
      ...baseSource,
      publication_date: '2025-13-01', // invalid month
    });
    expect(result.success).toBe(false);
  });
});

// -----------------------------------------------------------------------------
// Input bounds
// -----------------------------------------------------------------------------

describe('Input bounds', () => {
  it('CreateResearchSchema rejects findings over 50000 chars', () => {
    const result = CreateResearchSchema.safeParse({
      title: 'Test',
      output_format: 'factsheet',
      origin: 'human',
      dimensions: { market_ids: [], domain_ids: [], sector_ids: [] },
      findings: 'x'.repeat(50001),
    });
    expect(result.success).toBe(false);
  });

  it('UpdateResearchSchema rejects change_log over 10000 chars', () => {
    const result = UpdateResearchSchema.safeParse({
      change_log: 'x'.repeat(10001),
    });
    expect(result.success).toBe(false);
  });

  it('QueryResearchSchema rejects region over 100 chars', () => {
    const result = QueryResearchSchema.safeParse({
      region: 'x'.repeat(101),
    });
    expect(result.success).toBe(false);
  });
});

// -----------------------------------------------------------------------------
// CreateLegislationSchema
// -----------------------------------------------------------------------------

describe('CreateLegislationSchema', () => {
  const validPayload = {
    name: 'NEN 7510',
    market_ids: ['market-nl'],
    sector_ids: ['sector-hc'],
    scope: 'national' as const,
    effective_date: '2017-12-01',
  };

  it('accepts valid payload with required fields', () => {
    const result = CreateLegislationSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('applies default values', () => {
    const result = CreateLegislationSchema.parse(validPayload);
    expect(result.description).toBe('');
    expect(result.enforcement_authority).toBe('');
    expect(result.compliance_deadline).toBeNull();
    expect(result.context_document_id).toBeNull();
    expect(result.url).toBeNull();
    expect(result.tags).toEqual([]);
  });

  it('rejects empty name', () => {
    const result = CreateLegislationSchema.safeParse({
      ...validPayload,
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects name over 300 characters', () => {
    const result = CreateLegislationSchema.safeParse({
      ...validPayload,
      name: 'a'.repeat(301),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid scope', () => {
    const result = CreateLegislationSchema.safeParse({
      ...validPayload,
      scope: 'local',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty market_ids', () => {
    const result = CreateLegislationSchema.safeParse({
      ...validPayload,
      market_ids: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty sector_ids', () => {
    const result = CreateLegislationSchema.safeParse({
      ...validPayload,
      sector_ids: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date', () => {
    const result = CreateLegislationSchema.safeParse({
      ...validPayload,
      effective_date: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid compliance_deadline date', () => {
    const result = CreateLegislationSchema.safeParse({
      ...validPayload,
      compliance_deadline: '2025-06-01',
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid URL', () => {
    const result = CreateLegislationSchema.safeParse({
      ...validPayload,
      url: 'https://example.com/legislation',
    });
    expect(result.success).toBe(true);
  });
});

// -----------------------------------------------------------------------------
// UpdateLegislationSchema
// -----------------------------------------------------------------------------

describe('UpdateLegislationSchema', () => {
  it('accepts partial update with just name', () => {
    const result = UpdateLegislationSchema.safeParse({ name: 'Updated Name' });
    expect(result.success).toBe(true);
  });

  it('accepts empty object (all fields optional)', () => {
    const result = UpdateLegislationSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects empty string name', () => {
    const result = UpdateLegislationSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });
});

// -----------------------------------------------------------------------------
// QueryLegislationSchema
// -----------------------------------------------------------------------------

describe('QueryLegislationSchema', () => {
  it('accepts empty object and applies defaults', () => {
    const result = QueryLegislationSchema.parse({});
    expect(result.limit).toBe(50);
    expect(result.offset).toBe(0);
  });

  it('accepts all filters', () => {
    const result = QueryLegislationSchema.safeParse({
      market_id: 'market-nl',
      sector_id: 'sector-hc',
      scope: 'national',
      limit: 25,
      offset: 10,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative offset', () => {
    const result = QueryLegislationSchema.safeParse({ offset: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects limit greater than 100', () => {
    const result = QueryLegislationSchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid scope', () => {
    const result = QueryLegislationSchema.safeParse({ scope: 'state' });
    expect(result.success).toBe(false);
  });
});
