import { describe, it, expect, beforeEach } from 'vitest';
import {
  resetStore,
  resetStorage,
  seedCollection,
  getUploadedFiles,
} from './helpers/mock-admin';
import {
  VALID_FILE_PARAMS,
  PDF_BUFFER,
  DOCX_BUFFER,
  FAKE_PDF_BUFFER,
} from './helpers/fixtures';
import { validateMagicBytes, uploadResearchFile, listResearchFiles } from '../file-service';

beforeEach(() => {
  resetStore();
  resetStorage();
});

// ---------------------------------------------------------------------------
// validateMagicBytes (pure function)
// ---------------------------------------------------------------------------
describe('validateMagicBytes', () => {
  it('accepts valid PDF magic bytes', () => {
    expect(validateMagicBytes(PDF_BUFFER, 'application/pdf')).toBe(true);
  });

  it('rejects invalid PDF magic bytes', () => {
    expect(validateMagicBytes(FAKE_PDF_BUFFER, 'application/pdf')).toBe(false);
  });

  it('accepts valid DOCX magic bytes', () => {
    expect(validateMagicBytes(DOCX_BUFFER, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(true);
  });

  it('rejects invalid DOCX magic bytes', () => {
    const badDocx = Buffer.from([0x00, 0x01, 0x02, 0x03]);
    expect(validateMagicBytes(badDocx, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(false);
  });

  it('always passes for text types (no magic bytes)', () => {
    const textBuffer = Buffer.from('plain text content');
    expect(validateMagicBytes(textBuffer, 'text/plain')).toBe(true);
    expect(validateMagicBytes(textBuffer, 'text/markdown')).toBe(true);
    expect(validateMagicBytes(textBuffer, 'text/csv')).toBe(true);
    expect(validateMagicBytes(textBuffer, 'application/json')).toBe(true);
  });

  it('rejects empty buffer for binary types', () => {
    const empty = Buffer.alloc(0);
    expect(validateMagicBytes(empty, 'application/pdf')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// uploadResearchFile
// ---------------------------------------------------------------------------
describe('uploadResearchFile', () => {
  it('stores file in storage and creates a Firestore record', async () => {
    const result = await uploadResearchFile(VALID_FILE_PARAMS);

    expect(result.id).toMatch(/^mock-id-/);
    expect(result.file_name).toBe('report.pdf');
    expect(result.file_type).toBe('application/pdf');
    expect(result.research_id).toBe('research-1');
    expect(result.download_url).toContain('test-bucket');
    expect(result.uploaded_by).toBe('agent-mcp-test');
    expect(result.uploaded_at).toBeDefined();

    // Verify storage upload
    const files = getUploadedFiles();
    expect(files).toHaveLength(1);
    expect(files[0].path).toContain('research/research-1/');
    expect(files[0].path).toContain('report.pdf');
  });

  it('sets the correct storage path format', async () => {
    const result = await uploadResearchFile(VALID_FILE_PARAMS);
    expect(result.storage_path).toMatch(/^research\/research-1\/\d+-report\.pdf$/);
  });

  it('rejects files with bad magic bytes', async () => {
    await expect(
      uploadResearchFile({
        ...VALID_FILE_PARAMS,
        file_buffer: FAKE_PDF_BUFFER,
      }),
    ).rejects.toThrow('does not match declared type');
  });

  it('rejects files exceeding 50MB', async () => {
    const bigBuffer = Buffer.alloc(51 * 1024 * 1024);
    // Add PDF magic bytes
    bigBuffer[0] = 0x25; bigBuffer[1] = 0x50; bigBuffer[2] = 0x44; bigBuffer[3] = 0x46;

    await expect(
      uploadResearchFile({
        ...VALID_FILE_PARAMS,
        file_buffer: bigBuffer,
      }),
    ).rejects.toThrow();
  });

  it('rejects disallowed MIME types', async () => {
    await expect(
      uploadResearchFile({
        ...VALID_FILE_PARAMS,
        file_type: 'application/x-executable',
        file_buffer: Buffer.from('binary'),
      }),
    ).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// listResearchFiles
// ---------------------------------------------------------------------------
describe('listResearchFiles', () => {
  it('returns files for a research ID', async () => {
    seedCollection('file-attachments', {
      'file-1': {
        research_id: 'research-1',
        file_name: 'report.pdf',
        uploaded_at: '2025-01-01T00:00:00.000Z',
      },
      'file-2': {
        research_id: 'research-1',
        file_name: 'analysis.md',
        uploaded_at: '2025-01-02T00:00:00.000Z',
      },
    });

    const files = await listResearchFiles('research-1');
    expect(files).toHaveLength(2);
    expect(files[0].id).toBeDefined();
  });

  it('returns empty array when no files exist', async () => {
    const files = await listResearchFiles('research-no-files');
    expect(files).toHaveLength(0);
  });
});
