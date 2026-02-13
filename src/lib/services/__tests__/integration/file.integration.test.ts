/**
 * Integration tests for file-service against staging Firebase.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { initializeApp, cert, getApps, deleteApp } from 'firebase-admin/app';
import { readTestState, getServiceAccountCredentials, TEST_PREFIX } from './helpers';

let uploadResearchFile: typeof import('../../file-service').uploadResearchFile;
let listResearchFiles: typeof import('../../file-service').listResearchFiles;

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

  const mod = await import('../../file-service');
  uploadResearchFile = mod.uploadResearchFile;
  listResearchFiles = mod.listResearchFiles;
});

describe('file-service (integration)', () => {
  it('uploads a PDF file to staging storage', async () => {
    // Real PDF header + minimal content
    const pdfBuffer = Buffer.from('%PDF-1.4 integration test content');

    const result = await uploadResearchFile({
      research_id: state.researchId,
      file_name: `${TEST_PREFIX}_report.pdf`,
      file_type: 'application/pdf',
      file_buffer: pdfBuffer,
      uploaded_by: 'mcp-integration-test',
      origin: 'agent',
      source_id: null,
    });

    expect(result.id).toBeDefined();
    expect(result.file_name).toContain(TEST_PREFIX);
    expect(result.download_url).toContain('storage.googleapis.com');
    expect(result.storage_path).toContain(state.researchId);
  });

  it('rejects a file with bad magic bytes', async () => {
    const fakePdf = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]);

    await expect(
      uploadResearchFile({
        research_id: state.researchId,
        file_name: 'fake.pdf',
        file_type: 'application/pdf',
        file_buffer: fakePdf,
        uploaded_by: 'mcp-integration-test',
        origin: 'agent',
        source_id: null,
      }),
    ).rejects.toThrow('does not match declared type');
  });

  it('lists uploaded files for a research ID', async () => {
    const files = await listResearchFiles(state.researchId);

    // At least the file from the first test should be present
    expect(files.length).toBeGreaterThanOrEqual(1);
    expect(files[0].research_id).toBe(state.researchId);
  });
});
