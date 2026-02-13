import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'fs';
import { resolve } from 'path';

/** Test-run prefix used to identify and clean up test data. */
export const TEST_PREFIX = `_mcptest_${Date.now()}`;

// ---------------------------------------------------------------------------
// Service account key resolution
// ---------------------------------------------------------------------------

export function getServiceAccountCredentials(): Record<string, unknown> {
  // 1. Base64-encoded key from env (CI)
  const b64 = process.env.STAGING_SERVICE_ACCOUNT_KEY_BASE64;
  if (b64) {
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf-8'));
  }

  // 2. File path from env or default location (project root)
  const keyPath =
    process.env.STAGING_SERVICE_ACCOUNT_KEY ??
    resolve(__dirname, '../../../../../marketintelligence-hub-staging-sa-key.json');

  if (!existsSync(keyPath)) {
    throw new Error(
      `Staging service account key not found at ${keyPath}. ` +
        'Set STAGING_SERVICE_ACCOUNT_KEY_BASE64 or STAGING_SERVICE_ACCOUNT_KEY env var.',
    );
  }

  return JSON.parse(readFileSync(keyPath, 'utf-8'));
}

// ---------------------------------------------------------------------------
// Shared test state
// ---------------------------------------------------------------------------

const STATE_FILE = resolve(__dirname, '.test-state.json');

export interface TestState {
  researchId: string;
  notebookId: string;
}

export function writeTestState(state: TestState): void {
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
  if (existsSync(STATE_FILE)) {
    unlinkSync(STATE_FILE);
  }
}
