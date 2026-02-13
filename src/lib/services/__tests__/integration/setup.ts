/**
 * Global setup for MCP service integration tests.
 *
 * Initializes Firebase Admin SDK with the staging service account
 * and seeds a test research document for consumption by test files.
 */

import { initializeApp, cert, getApps, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {
  getServiceAccountCredentials,
  writeTestState,
  TEST_PREFIX,
} from './helpers';

export async function setup(): Promise<void> {
  console.log('[mcp-integration setup] Initializing Admin SDK for staging...');

  const credentials = getServiceAccountCredentials();

  for (const app of getApps()) {
    await deleteApp(app);
  }

  const app = initializeApp(
    { credential: cert(credentials as Parameters<typeof cert>[0]) },
    'mcp-integration-setup',
  );

  const db = getFirestore(app);

  // Seed a research document with a notebook
  console.log('[mcp-integration setup] Seeding test research...');
  const notebookId = `${TEST_PREFIX}_nb_1`;
  const now = new Date().toISOString();

  const researchRef = await db.collection('research').add({
    title: `${TEST_PREFIX} MCP Integration Research`,
    description: 'Pre-seeded research for MCP service integration tests',
    type: 'new',
    output_format: 'factsheet',
    refresh_schedule: 'ad_hoc',
    status: 'draft',
    created_at: now,
    updated_at: now,
    published_at: null,
    expires_at: null,
    next_refresh_date: null,
    author_id: 'mcp-integration-test',
    reviewer_id: null,
    dimensions: {
      markets: [{ id: 'market-nl', name: 'Netherlands', code: 'NL' }],
      domains: [{ id: 'domain-sec', name: 'Security', code: 'SEC' }],
      sectors: [{ id: 'sector-fs', name: 'Financial Services', code: 'FS' }],
    },
    tags: [],
    context_documents: [],
    notebooks: [
      {
        id: notebookId,
        type: 'competitive',
        sources: [],
        findings: '',
      },
    ],
    findings: '',
    synthesis: 'Pre-seeded synthesis for MCP testing',
    change_log: '',
    assumptions: [],
    related_research_ids: [],
    version_ids: [],
    origin: 'agent',
    agent_identity: {
      agent_id: 'mcp-integration-test',
      agent_name: 'MCP Integration Test Suite',
      agent_version: '1.0.0',
      run_id: `setup-${Date.now()}`,
    },
    input_context: [],
    review_status: 'pending',
    previous_version_id: null,
    cloned_from_id: null,
    cloned_changed_dimension: null,
  });

  writeTestState({
    researchId: researchRef.id,
    notebookId,
  });

  await deleteApp(app);
  console.log('[mcp-integration setup] Done. Research ID:', researchRef.id);
}
