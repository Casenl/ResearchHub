import { describe, it, expect, beforeEach } from 'vitest';
import { resetStore, seedCollection, getDoc } from './helpers/mock-admin';
import { SEEDED_RESEARCH, VALID_SOURCE_PAYLOAD, makeSourcePayload } from './helpers/fixtures';
import { addSource, validateSource } from '../source-service';

beforeEach(() => {
  resetStore();
  seedCollection('research', SEEDED_RESEARCH);
});

// ---------------------------------------------------------------------------
// addSource
// ---------------------------------------------------------------------------
describe('addSource', () => {
  it('adds a source to an existing notebook', async () => {
    const source = await addSource('research-1', 'nb-1', VALID_SOURCE_PAYLOAD, 'agent-1');

    expect(source.id).toMatch(/^src-/);
    expect(source.title).toBe(VALID_SOURCE_PAYLOAD.title);
    expect(source.validation_status).toBe('unverified');

    // Verify the research doc was updated
    const doc = getDoc('research', 'research-1')!;
    const notebooks = doc.notebooks as Array<{ id: string; sources: Array<{ id: string }> }>;
    const nb = notebooks.find(n => n.id === 'nb-1')!;
    expect(nb.sources).toHaveLength(2); // existing + new
    expect(nb.sources[1].id).toBe(source.id);
  });

  it('auto-creates a notebook when it does not exist (Bug #2 regression)', async () => {
    const source = await addSource('research-1', 'nb-new', VALID_SOURCE_PAYLOAD, 'agent-1');

    expect(source.id).toMatch(/^src-/);

    const doc = getDoc('research', 'research-1')!;
    const notebooks = doc.notebooks as Array<{ id: string; sources: Array<{ id: string }> }>;
    const newNb = notebooks.find(n => n.id === 'nb-new');
    expect(newNb).toBeDefined();
    expect(newNb!.sources).toHaveLength(1);
    expect(newNb!.sources[0].id).toBe(source.id);
  });

  it('does not overwrite existing sources when appending', async () => {
    await addSource('research-1', 'nb-1', makeSourcePayload({ title: 'Source A' }), 'agent-1');
    await addSource('research-1', 'nb-1', makeSourcePayload({ title: 'Source B' }), 'agent-1');

    const doc = getDoc('research', 'research-1')!;
    const notebooks = doc.notebooks as Array<{ id: string; sources: Array<{ title: string }> }>;
    const nb = notebooks.find(n => n.id === 'nb-1')!;
    // 1 existing + 2 new = 3
    expect(nb.sources).toHaveLength(3);
    expect(nb.sources.map(s => s.title)).toContain('Source A');
    expect(nb.sources.map(s => s.title)).toContain('Source B');
  });

  it('uses the provided quality_tier', async () => {
    const source = await addSource(
      'research-1', 'nb-1',
      makeSourcePayload({ quality_tier: 2 }),
      'agent-1',
    );
    expect(source.quality_tier).toBe(2);
  });

  it('sets validation_status to unverified', async () => {
    const source = await addSource('research-1', 'nb-1', VALID_SOURCE_PAYLOAD, 'agent-1');
    expect(source.validation_status).toBe('unverified');
    expect(source.validated_by).toBeNull();
    expect(source.validated_at).toBeNull();
  });

  it('generates a src- prefixed ID', async () => {
    const source = await addSource('research-1', 'nb-1', VALID_SOURCE_PAYLOAD, 'agent-1');
    expect(source.id).toMatch(/^src-\d+$/);
  });

  it('throws when research does not exist', async () => {
    resetStore(); // clear the seeded data
    await expect(
      addSource('non-existent', 'nb-1', VALID_SOURCE_PAYLOAD, 'agent-1'),
    ).rejects.toThrow('not found');
  });
});

// ---------------------------------------------------------------------------
// validateSource
// ---------------------------------------------------------------------------
describe('validateSource', () => {
  it('adjusts tier down by 1 for corroborated', async () => {
    // src-existing has quality_tier 4
    const result = await validateSource(
      'research-1', 'src-existing',
      { validation_status: 'corroborated', validation_notes: 'Confirmed' },
      'validator-1',
    );
    expect(result.new_tier).toBe(3); // 4 - 1
    expect(result.new_status).toBe('corroborated');
  });

  it('adjusts tier down by 2 for human_verified', async () => {
    const result = await validateSource(
      'research-1', 'src-existing',
      { validation_status: 'human_verified', validation_notes: '' },
      'validator-1',
    );
    expect(result.new_tier).toBe(2); // 4 - 2
  });

  it('adjusts tier up by 2 for disputed', async () => {
    const result = await validateSource(
      'research-1', 'src-existing',
      { validation_status: 'disputed', validation_notes: 'Questionable' },
      'validator-1',
    );
    expect(result.new_tier).toBe(6); // 4 + 2
  });

  it('floors tier at 1 (cannot go below)', async () => {
    // Seed a source at tier 1
    const research = getDoc('research', 'research-1')!;
    const notebooks = research.notebooks as Array<{ sources: Array<{ id: string; quality_tier: number }> }>;
    notebooks[0].sources[0].quality_tier = 1;

    const result = await validateSource(
      'research-1', 'src-existing',
      { validation_status: 'corroborated', validation_notes: '' },
      'validator-1',
    );
    expect(result.new_tier).toBe(1);
  });

  it('caps tier at 8 (cannot exceed)', async () => {
    // Seed a source at tier 7
    const research = getDoc('research', 'research-1')!;
    const notebooks = research.notebooks as Array<{ sources: Array<{ id: string; quality_tier: number }> }>;
    notebooks[0].sources[0].quality_tier = 7;

    const result = await validateSource(
      'research-1', 'src-existing',
      { validation_status: 'disputed', validation_notes: '' },
      'validator-1',
    );
    expect(result.new_tier).toBe(8); // 7 + 2 capped at 8
  });

  it('throws when source is not found', async () => {
    await expect(
      validateSource(
        'research-1', 'src-nonexistent',
        { validation_status: 'corroborated', validation_notes: '' },
        'validator-1',
      ),
    ).rejects.toThrow('not found');
  });
});
