import { describe, it, expect } from 'vitest';
import {
  CreateResearchSchema,
  UpdateResearchSchema,
  QueryResearchSchema,
  CreateSourceSchema,
  ValidateSourceSchema,
  UploadFileSchema,
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
