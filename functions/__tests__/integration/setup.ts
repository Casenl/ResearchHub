/**
 * Global setup for integration tests.
 *
 * Initializes Firebase Admin SDK with the staging service account,
 * seeds API keys and a test research document, then writes state to
 * a temporary file for consumption by individual test files.
 */

import { initializeApp, cert, getApps, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createHash } from 'crypto';
import {
  getServiceAccountCredentials,
  writeTestState,
  TEST_PREFIX,
} from './helpers';

export async function setup(): Promise<void> {
  console.log('[integration setup] Initializing Admin SDK for staging...');

  const credentials = getServiceAccountCredentials();

  // Clean up any stale app
  for (const app of getApps()) {
    await deleteApp(app);
  }

  const app = initializeApp(
    { credential: cert(credentials as Parameters<typeof cert>[0]) },
    'integration-test-setup',
  );

  const db = getFirestore(app);

  // -----------------------------------------------------------------------
  // Seed API keys with known plaintext values
  // -----------------------------------------------------------------------
  console.log('[integration setup] Seeding API keys...');

  const keys = [
    {
      plaintext: `rh_test_admin_${Date.now()}`,
      name: `${TEST_PREFIX}_admin_key`,
      permissions: 'admin' as const,
    },
    {
      plaintext: `rh_test_readwrite_${Date.now()}`,
      name: `${TEST_PREFIX}_readwrite_key`,
      permissions: 'read_write' as const,
    },
    {
      plaintext: `rh_test_read_${Date.now()}`,
      name: `${TEST_PREFIX}_read_key`,
      permissions: 'read' as const,
    },
  ];

  const keyResults: Array<{ id: string; plaintext: string }> = [];

  for (const key of keys) {
    const keyHash = createHash('sha256').update(key.plaintext).digest('hex');
    const ref = await db.collection('api-keys').add({
      name: key.name,
      key_hash: keyHash,
      permissions: key.permissions,
      agent_identity: {
        agent_id: 'integration-test',
        agent_name: 'Integration Test Suite',
        agent_version: '1.0.0',
        run_id: `setup-${Date.now()}`,
      },
      created_by: 'integration-test-setup',
      created_at: new Date().toISOString(),
      last_used_at: null,
      is_active: true,
      expires_at: null,
    });
    keyResults.push({ id: ref.id, plaintext: key.plaintext });
  }

  // -----------------------------------------------------------------------
  // Seed a test research document with a notebook (for source/file tests)
  // -----------------------------------------------------------------------
  console.log('[integration setup] Seeding test research document...');

  const notebookId = `${TEST_PREFIX}_nb_1`;
  const now = new Date().toISOString();

  const researchRef = await db.collection('research').add({
    title: `${TEST_PREFIX} Seeded Research`,
    description: 'Pre-seeded research for integration tests',
    type: 'new',
    output_format: 'factsheet',
    refresh_schedule: 'ad_hoc',
    status: 'draft',
    created_at: now,
    updated_at: now,
    published_at: null,
    expires_at: null,
    next_refresh_date: null,
    author_id: 'integration-test',
    reviewer_id: null,
    dimensions: {
      markets: [{ id: 'nl', name: 'Netherlands', code: 'NL' }],
      domains: [{ id: 'cloud', name: 'Cloud', code: 'cloud' }],
      sectors: [{ id: 'financial-services', name: 'Financial Services', code: 'financial-services' }],
    },
    tags: [],
    context_documents: [],
    notebooks: [
      {
        id: notebookId,
        type: 'competitive',
        sources: [],
        findings: '',
        status: 'open',
      },
    ],
    findings: 'Pre-seeded findings for testing',
    synthesis: 'Pre-seeded synthesis for testing',
    change_log: '',
    assumptions: [],
    related_research_ids: [],
    version_ids: [],
    origin: 'agent',
    agent_identity: {
      agent_id: 'integration-test',
      agent_name: 'Integration Test Suite',
      agent_version: '1.0.0',
      run_id: `setup-${Date.now()}`,
    },
    input_context: [],
    review_status: 'pending',
  });

  // -----------------------------------------------------------------------
  // Write state for test consumption
  // -----------------------------------------------------------------------
  writeTestState({
    adminKey: keyResults[0].plaintext,
    readWriteKey: keyResults[1].plaintext,
    readKey: keyResults[2].plaintext,
    adminKeyId: keyResults[0].id,
    readWriteKeyId: keyResults[1].id,
    readKeyId: keyResults[2].id,
    researchId: researchRef.id,
    notebookId,
  });

  await deleteApp(app);

  console.log('[integration setup] Done. Research ID:', researchRef.id);
}
