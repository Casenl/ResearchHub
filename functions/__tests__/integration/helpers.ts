import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// Staging environment configuration
// ---------------------------------------------------------------------------

const DEFAULT_STAGING_URL =
  'https://europe-west1-marketintelligence-hub-staging.cloudfunctions.net/api';

export const STAGING_API_URL =
  process.env.STAGING_API_URL ?? DEFAULT_STAGING_URL;

/** Test-run prefix used to identify and clean up test data. */
export const TEST_PREFIX = `_test_${Date.now()}`;

// ---------------------------------------------------------------------------
// Service account key resolution
// ---------------------------------------------------------------------------

export function getServiceAccountCredentials(): Record<string, unknown> {
  // 1. Base64-encoded key from env (CI)
  const b64 = process.env.STAGING_SERVICE_ACCOUNT_KEY_BASE64;
  if (b64) {
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf-8'));
  }

  // 2. File path from env or default location
  const keyPath =
    process.env.STAGING_SERVICE_ACCOUNT_KEY ??
    resolve(__dirname, '../../../marketintelligence-hub-staging-sa-key.json');

  if (!existsSync(keyPath)) {
    throw new Error(
      `Staging service account key not found at ${keyPath}. ` +
        'Set STAGING_SERVICE_ACCOUNT_KEY_BASE64 or STAGING_SERVICE_ACCOUNT_KEY env var.',
    );
  }

  return JSON.parse(readFileSync(keyPath, 'utf-8'));
}

// ---------------------------------------------------------------------------
// Shared test state (populated by global setup, consumed by tests)
// ---------------------------------------------------------------------------

const STATE_FILE = resolve(__dirname, '.test-state.json');

export interface TestState {
  adminKey: string;
  readWriteKey: string;
  readKey: string;
  adminKeyId: string;
  readWriteKeyId: string;
  readKeyId: string;
  researchId: string;
  notebookId: string;
}

export function writeTestState(state: TestState): void {
  const { writeFileSync } = require('fs');
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

export function readTestState(): TestState {
  if (!existsSync(STATE_FILE)) {
    throw new Error(
      'Test state file not found. Did the global setup run successfully?',
    );
  }
  return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
}

export function cleanTestState(): void {
  const { unlinkSync } = require('fs');
  if (existsSync(STATE_FILE)) {
    unlinkSync(STATE_FILE);
  }
}

// ---------------------------------------------------------------------------
// Authenticated fetch wrapper
// ---------------------------------------------------------------------------

interface FetchOptions extends RequestInit {
  apiKey?: string;
}

/**
 * Make a request to the staging API with automatic JSON handling and auth.
 */
export async function apiFetch(
  path: string,
  options: FetchOptions = {},
): Promise<{ status: number; body: Record<string, unknown> }> {
  const { apiKey, ...fetchOpts } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOpts.headers as Record<string, string>),
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const url = `${STAGING_API_URL}${path}`;
  const response = await fetch(url, {
    ...fetchOpts,
    headers,
  });

  const text = await response.text();
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    body = { _raw: text };
  }

  return { status: response.status, body };
}

// ---------------------------------------------------------------------------
// Test data factories
// ---------------------------------------------------------------------------

export function makeResearchPayload(overrides: Record<string, unknown> = {}) {
  return {
    title: `${TEST_PREFIX} Integration Test Research`,
    description: 'Created by integration test suite',
    type: 'new',
    output_format: 'factsheet',
    refresh_schedule: 'ad_hoc',
    origin: 'agent',
    agent_identity: {
      agent_id: 'integration-test',
      agent_name: 'Integration Test Suite',
      agent_version: '1.0.0',
      run_id: `run-${Date.now()}`,
    },
    dimensions: {
      market_ids: ['nl'],
      domain_ids: ['cloud'],
      sector_ids: ['financial-services'],
    },
    findings: '',
    synthesis: '',
    assumptions: [],
    input_context: [],
    tag_ids: [],
    context_document_ids: [],
    ...overrides,
  };
}

export function makeSourcePayload(overrides: Record<string, unknown> = {}) {
  return {
    title: `${TEST_PREFIX} Test Source`,
    url: 'https://example.com/test-source',
    publisher: 'Test Publisher',
    publication_date: '2025-01-01',
    quality_tier: 4,
    discovered_by: 'manual',
    notes: 'Created by integration test',
    ...overrides,
  };
}
