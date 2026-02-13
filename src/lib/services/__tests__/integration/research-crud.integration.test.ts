/**
 * Integration tests for research-crud-service against staging Firebase.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { initializeApp, cert, getApps, deleteApp } from 'firebase-admin/app';
import { readTestState, getServiceAccountCredentials, TEST_PREFIX } from './helpers';

// Services under test — these use getAdminFirestore() which we need to
// point at staging. We do this by setting FIREBASE_ADMIN_SDK_PATH env var
// or by initializing the admin app before importing the services.
let createResearch: typeof import('../../research-crud-service').createResearch;
let getResearch: typeof import('../../research-crud-service').getResearch;
let updateResearch: typeof import('../../research-crud-service').updateResearch;
let archiveResearch: typeof import('../../research-crud-service').archiveResearch;

let state: ReturnType<typeof readTestState>;

beforeAll(async () => {
  state = readTestState();

  // Initialize Firebase Admin with staging credentials before importing services
  const credentials = getServiceAccountCredentials();
  for (const app of getApps()) {
    await deleteApp(app);
  }
  initializeApp(
    {
      credential: cert(credentials as Parameters<typeof cert>[0]),
      storageBucket: 'marketintelligence-hub-staging.firebasestorage.app',
    },
  );

  // Dynamic import after admin app is initialized
  const mod = await import('../../research-crud-service');
  createResearch = mod.createResearch;
  getResearch = mod.getResearch;
  updateResearch = mod.updateResearch;
  archiveResearch = mod.archiveResearch;
});

describe('research-crud-service (integration)', () => {
  it('creates a research entry in staging Firestore', async () => {
    const result = await createResearch(
      {
        title: `${TEST_PREFIX} Integration Create Test`,
        description: 'Created by integration test',
        type: 'new',
        output_format: 'factsheet',
        refresh_schedule: 'ad_hoc',
        origin: 'agent',
        agent_identity: {
          agent_id: 'mcp-integration-test',
          agent_name: 'MCP Integration Test Suite',
          agent_version: '1.0.0',
          run_id: `create-${Date.now()}`,
        },
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
      },
      'mcp-integration-test',
      'MCP Integration Test Suite',
    );

    expect(result.id).toBeDefined();
    expect(result.title).toContain(TEST_PREFIX);
    expect(result.dimensions.markets).toHaveLength(1);
    expect(result.dimensions.markets[0].id).toBe('market-nl');
  });

  it('gets the seeded research by ID', async () => {
    const result = await getResearch(state.researchId);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(state.researchId);
    expect(result!.title).toContain(TEST_PREFIX);
  });

  it('updates the seeded research', async () => {
    await updateResearch(
      state.researchId,
      { synthesis: 'Updated by integration test' },
      'mcp-integration-test',
      'MCP Integration Test Suite',
    );

    const updated = await getResearch(state.researchId);
    expect(updated!.synthesis).toBe('Updated by integration test');
  });

  it('archives research', async () => {
    // Create a new one to archive (don't archive the seeded one used by other tests)
    const created = await createResearch(
      {
        title: `${TEST_PREFIX} To Archive`,
        description: 'Will be archived',
        type: 'new',
        output_format: 'factsheet',
        refresh_schedule: 'ad_hoc',
        origin: 'agent',
        agent_identity: {
          agent_id: 'mcp-integration-test',
          agent_name: 'MCP Integration Test Suite',
          agent_version: '1.0.0',
          run_id: `archive-${Date.now()}`,
        },
        dimensions: { market_ids: ['market-nl'], domain_ids: [], sector_ids: [] },
        findings: '',
        synthesis: '',
        assumptions: [],
        input_context: [],
        tag_ids: [],
        context_document_ids: [],
      },
      'mcp-integration-test',
      'MCP Integration Test Suite',
    );

    await archiveResearch(created.id, 'mcp-integration-test', 'MCP Integration Test Suite');
    const archived = await getResearch(created.id);
    expect(archived!.status).toBe('archived');
  });
});
