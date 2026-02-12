import { describe, it, expect, beforeAll } from 'vitest';
import { apiFetch, readTestState, TEST_PREFIX, type TestState } from './helpers';

let state: TestState;

beforeAll(() => {
  state = readTestState();
});

/** A minimal valid PDF (magic bytes %PDF). */
function makePdfBase64(): string {
  const pdfContent = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF',
    'utf-8',
  );
  return pdfContent.toString('base64');
}

/** Invalid content that doesn't match PDF magic bytes. */
function makeFakePdfBase64(): string {
  return Buffer.from('This is not a PDF file at all').toString('base64');
}

describe('File uploads (integration)', () => {
  let uploadedFileId: string;
  let uploadedDownloadUrl: string;

  it('POST /:id/files uploads a PDF and returns download URL', async () => {
    const { status, body } = await apiFetch(
      `/research/${state.researchId}/files`,
      {
        method: 'POST',
        body: JSON.stringify({
          file_name: `${TEST_PREFIX}_test.pdf`,
          file_type: 'application/pdf',
          file_data: makePdfBase64(),
          source_id: null,
        }),
        apiKey: state.readWriteKey,
      },
    );

    expect(status).toBe(201);
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('download_url');
    expect(typeof body.download_url).toBe('string');
    expect(body.file_name).toContain(TEST_PREFIX);
    uploadedFileId = body.id as string;
    uploadedDownloadUrl = body.download_url as string;
  });

  it('GET /:id/files returns the uploaded file in the list', async () => {
    const { status, body } = await apiFetch(
      `/research/${state.researchId}/files`,
      { apiKey: state.readKey },
    );

    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);

    const files = body as unknown as Array<Record<string, unknown>>;
    const found = files.find((f) => f.id === uploadedFileId);
    expect(found).toBeDefined();
    expect(found!.file_name).toContain(TEST_PREFIX);
  });

  it('uploaded file is accessible via download URL', async () => {
    // Use the download URL stored from the upload response
    expect(uploadedDownloadUrl).toBeTruthy();

    const response = await fetch(uploadedDownloadUrl);
    expect(response.status).toBe(200);
  });

  it('rejects file with mismatched magic bytes', async () => {
    const { status, body } = await apiFetch(
      `/research/${state.researchId}/files`,
      {
        method: 'POST',
        body: JSON.stringify({
          file_name: `${TEST_PREFIX}_fake.pdf`,
          file_type: 'application/pdf',
          file_data: makeFakePdfBase64(),
          source_id: null,
        }),
        apiKey: state.readWriteKey,
      },
    );

    expect(status).toBe(400);
    expect(body.error).toContain('MIME type');
  });

  it('text file upload skips magic byte check', async () => {
    const textContent = Buffer.from('Integration test content').toString('base64');

    const { status, body } = await apiFetch(
      `/research/${state.researchId}/files`,
      {
        method: 'POST',
        body: JSON.stringify({
          file_name: `${TEST_PREFIX}_notes.txt`,
          file_type: 'text/plain',
          file_data: textContent,
          source_id: null,
        }),
        apiKey: state.readWriteKey,
      },
    );

    expect(status).toBe(201);
    expect(body.file_type).toBe('text/plain');
  });
});
