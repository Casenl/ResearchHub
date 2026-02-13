/**
 * Integration tests for source-service against staging Firebase.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { initializeApp, cert, getApps, deleteApp } from 'firebase-admin/app';
import { readTestState, getServiceAccountCredentials, TEST_PREFIX } from './helpers';

let addSource: typeof import('../../source-service').addSource;
let validateSource: typeof import('../../source-service').validateSource;
let getResearch: typeof import('../../research-crud-service').getResearch;

let state: ReturnType<typeof readTestState>;

beforeAll(async () => {
  state = readTestState();

  const credentials = getServiceAccountCredentials();
  for (const app of getApps()) {
    await deleteApp(app);
  }
  initializeApp({
    credential: cert(credentials as Parameters<typeof cert>[0]),
    storageBucket: 'marketintelligence-hub-staging.firebasestorage.app',
  });

  const sourceMod = await import('../../source-service');
  addSource = sourceMod.addSource;
  validateSource = sourceMod.validateSource;

  const researchMod = await import('../../research-crud-service');
  getResearch = researchMod.getResearch;
});

describe('source-service (integration)', () => {
  it('adds a source to an existing notebook', async () => {
    const source = await addSource(
      state.researchId,
      state.notebookId,
      {
        title: `${TEST_PREFIX} Integration Source`,
        url: 'https://example.com/integration-source',
        publisher: 'Integration Test Publisher',
        publication_date: '2025-01-01',
        quality_tier: 4,
        discovered_by: 'manual',
        notes: 'Added by integration test',
      },
      'mcp-integration-test',
    );

    expect(source.id).toMatch(/^src-/);
    expect(source.title).toContain(TEST_PREFIX);
    expect(source.validation_status).toBe('unverified');
  });

  it('auto-creates a notebook when missing (Bug #2 regression)', async () => {
    const newNotebookId = `${TEST_PREFIX}_auto_nb`;
    const source = await addSource(
      state.researchId,
      newNotebookId,
      {
        title: `${TEST_PREFIX} Auto-Created NB Source`,
        url: 'https://example.com/auto-nb-source',
        publisher: 'Integration Publisher',
        publication_date: '2025-01-01',
        quality_tier: 5,
        discovered_by: 'claude',
        notes: '',
      },
      'mcp-integration-test',
    );

    expect(source.id).toMatch(/^src-/);

    // Verify the notebook was created in the research doc
    const research = await getResearch(state.researchId);
    const notebooks = research!.notebooks as Array<{ id: string; sources: Array<{ id: string }> }>;
    const autoNb = notebooks.find(nb => nb.id === newNotebookId);
    expect(autoNb).toBeDefined();
    expect(autoNb!.sources.length).toBeGreaterThanOrEqual(1);
  });

  it('validates a source (corroboration adjusts tier)', async () => {
    // First add a source to validate
    const source = await addSource(
      state.researchId,
      state.notebookId,
      {
        title: `${TEST_PREFIX} Source To Validate`,
        url: 'https://example.com/validate-me',
        publisher: 'Validator Publisher',
        publication_date: '2025-01-01',
        quality_tier: 4,
        discovered_by: 'manual',
        notes: '',
      },
      'mcp-integration-test',
    );

    const result = await validateSource(
      state.researchId,
      source.id,
      { validation_status: 'corroborated', validation_notes: 'Confirmed via integration test' },
      'mcp-integration-test',
    );

    expect(result.new_tier).toBe(3); // 4 - 1
    expect(result.new_status).toBe('corroborated');
  });
});
