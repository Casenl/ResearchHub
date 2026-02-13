import { describe, it, expect, beforeEach } from 'vitest';
import { resetStore, seedCollection, getDoc, getAllDocs } from './helpers/mock-admin';
import {
  VALID_CREATE_PAYLOAD,
  CREATE_PAYLOAD_UNKNOWN_IDS,
  HUMAN_CREATE_PAYLOAD,
  SEEDED_RESEARCH,
  AGENT_IDENTITY,
} from './helpers/fixtures';
import {
  createResearch,
  getResearch,
  updateResearch,
  archiveResearch,
} from '../research-crud-service';

beforeEach(() => {
  resetStore();
});

// ---------------------------------------------------------------------------
// createResearch
// ---------------------------------------------------------------------------
describe('createResearch', () => {
  it('returns an object with id and all expected fields', async () => {
    const result = await createResearch(VALID_CREATE_PAYLOAD, 'actor-1', 'Test Actor');

    expect(result.id).toMatch(/^mock-id-/);
    expect(result.title).toBe(VALID_CREATE_PAYLOAD.title);
    expect(result.status).toBe('draft');
    expect(result.origin).toBe('agent');
    expect(result.created_at).toBeDefined();
    expect(result.updated_at).toBeDefined();
    expect(result.author_id).toBe('actor-1');
  });

  it('resolves dimension IDs to full taxonomy objects (Bug #1 regression)', async () => {
    const result = await createResearch(VALID_CREATE_PAYLOAD, 'actor-1', 'Test Actor');

    // market-nl should resolve to the full Netherlands market object
    expect(result.dimensions.markets).toHaveLength(1);
    expect(result.dimensions.markets[0]).toMatchObject({
      id: 'market-nl',
      name: 'Netherlands',
      code: 'NL',
    });

    // domain-sec should resolve to the full Security domain object
    expect(result.dimensions.domains).toHaveLength(1);
    expect(result.dimensions.domains[0]).toMatchObject({
      id: 'domain-sec',
      name: 'Security',
      code: 'SEC',
    });

    // sector-fs should resolve to the full Financial Services sector object
    expect(result.dimensions.sectors).toHaveLength(1);
    expect(result.dimensions.sectors[0]).toMatchObject({
      id: 'sector-fs',
      name: 'Financial Services',
      code: 'FS',
    });
  });

  it('filters out unknown taxonomy IDs without failing', async () => {
    const result = await createResearch(CREATE_PAYLOAD_UNKNOWN_IDS, 'actor-1', 'Test Actor');

    // Only the valid IDs should be resolved
    expect(result.dimensions.markets).toHaveLength(1);
    expect(result.dimensions.markets[0].id).toBe('market-nl');

    expect(result.dimensions.domains).toHaveLength(1);
    expect(result.dimensions.domains[0].id).toBe('domain-sec');

    expect(result.dimensions.sectors).toHaveLength(1);
    expect(result.dimensions.sectors[0].id).toBe('sector-fs');
  });

  it('sets review_status to "pending" for agent origin', async () => {
    const result = await createResearch(VALID_CREATE_PAYLOAD, 'actor-1', 'Test Actor');
    expect(result.review_status).toBe('pending');
  });

  it('sets review_status to "none" for human origin', async () => {
    const result = await createResearch(HUMAN_CREATE_PAYLOAD, 'actor-1', 'Test Actor');
    expect(result.review_status).toBe('none');
  });

  it('writes an audit log entry', async () => {
    await createResearch(VALID_CREATE_PAYLOAD, 'actor-1', 'Test Actor');
    const auditLogs = getAllDocs('audit_logs');

    expect(auditLogs).toHaveLength(1);
    expect(auditLogs[0].data.action).toBe('created');
    expect(auditLogs[0].data.target_type).toBe('research');
    expect(auditLogs[0].data.category).toBe('api');
  });

  it('rejects invalid input (missing title)', async () => {
    const invalid = { ...VALID_CREATE_PAYLOAD, title: '' };
    await expect(createResearch(invalid, 'actor-1', 'Test Actor')).rejects.toThrow();
  });

  it('stores agent_identity on the document', async () => {
    const result = await createResearch(VALID_CREATE_PAYLOAD, 'actor-1', 'Test Actor');
    expect(result.agent_identity).toMatchObject(AGENT_IDENTITY);
  });
});

// ---------------------------------------------------------------------------
// getResearch
// ---------------------------------------------------------------------------
describe('getResearch', () => {
  it('returns the research document by ID', async () => {
    seedCollection('research', SEEDED_RESEARCH);
    const result = await getResearch('research-1');

    expect(result).not.toBeNull();
    expect(result!.id).toBe('research-1');
    expect(result!.title).toBe('Netherlands Cloud Research');
  });

  it('returns null for a non-existent ID', async () => {
    const result = await getResearch('non-existent');
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// updateResearch
// ---------------------------------------------------------------------------
describe('updateResearch', () => {
  it('updates fields and sets updated_at', async () => {
    seedCollection('research', SEEDED_RESEARCH);
    await updateResearch('research-1', { title: 'Updated Title' }, 'actor-1', 'Test Actor');

    const doc = getDoc('research', 'research-1')!;
    expect(doc.title).toBe('Updated Title');
    expect(doc.updated_at).toBeDefined();
    expect(doc.updated_at).not.toBe('2025-01-15T10:00:00.000Z');
  });

  it('throws when research does not exist', async () => {
    await expect(
      updateResearch('non-existent', { title: 'X' }, 'actor-1', 'Test Actor'),
    ).rejects.toThrow('not found');
  });

  it('writes an audit log entry for the update', async () => {
    seedCollection('research', SEEDED_RESEARCH);
    await updateResearch('research-1', { title: 'Updated' }, 'actor-1', 'Test Actor');

    const auditLogs = getAllDocs('audit_logs');
    expect(auditLogs).toHaveLength(1);
    expect(auditLogs[0].data.action).toBe('updated');
    expect((auditLogs[0].data.details as Record<string, unknown>).fields_updated).toContain('title');
  });
});

// ---------------------------------------------------------------------------
// archiveResearch
// ---------------------------------------------------------------------------
describe('archiveResearch', () => {
  it('sets status to archived', async () => {
    seedCollection('research', SEEDED_RESEARCH);
    await archiveResearch('research-1', 'actor-1', 'Test Actor');

    const doc = getDoc('research', 'research-1')!;
    expect(doc.status).toBe('archived');
  });

  it('throws when research does not exist', async () => {
    await expect(
      archiveResearch('non-existent', 'actor-1', 'Test Actor'),
    ).rejects.toThrow('not found');
  });

  it('writes an audit log entry for archival', async () => {
    seedCollection('research', SEEDED_RESEARCH);
    await archiveResearch('research-1', 'actor-1', 'Test Actor');

    const auditLogs = getAllDocs('audit_logs');
    expect(auditLogs).toHaveLength(1);
    expect(auditLogs[0].data.action).toBe('archived');
  });
});
