import { describe, it, expect, beforeEach } from 'vitest';
import { request, authHeader, setupTest } from './helpers/test-utils';
import { seedCollection, getAllDocs } from './helpers/mock-firestore';
import { getUploadedFiles } from './helpers/mock-storage';
import { VALID_FILE_PAYLOAD } from './helpers/fixtures';

describe('Files Routes', () => {
  beforeEach(() => {
    setupTest();
  });

  // =========================================================================
  // POST /research/:id/files
  // =========================================================================
  describe('POST /research/:id/files', () => {
    it('uploads a valid PDF and returns 201', async () => {
      const res = await request()
        .post('/research/some-research/files')
        .set('Authorization', authHeader('read_write'))
        .send(VALID_FILE_PAYLOAD);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.file_name).toBe('test.pdf');
      expect(res.body.download_url).toContain('storage.googleapis.com');
      expect(res.body.research_id).toBe('some-research');
    });

    it('rejects invalid MIME type', async () => {
      const res = await request()
        .post('/research/some-research/files')
        .set('Authorization', authHeader('read_write'))
        .send({ ...VALID_FILE_PAYLOAD, file_type: 'application/zip' });

      expect(res.status).toBe(400);
    });

    it('rejects file exceeding size limit', async () => {
      // Create a base64 string that decodes to >50MB
      const largeBuffer = Buffer.alloc(51 * 1024 * 1024, 0x25);
      // Set PDF magic bytes
      largeBuffer[0] = 0x25; // %
      largeBuffer[1] = 0x50; // P
      largeBuffer[2] = 0x44; // D
      largeBuffer[3] = 0x46; // F

      const res = await request()
        .post('/research/some-research/files')
        .set('Authorization', authHeader('read_write'))
        .send({
          ...VALID_FILE_PAYLOAD,
          file_data: largeBuffer.toString('base64'),
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/size/i);
    });

    it('rejects file with magic bytes mismatch', async () => {
      // Declare PDF but send non-PDF content
      const nonPdfContent = Buffer.from('not a pdf file at all');
      const res = await request()
        .post('/research/some-research/files')
        .set('Authorization', authHeader('read_write'))
        .send({
          ...VALID_FILE_PAYLOAD,
          file_data: nonPdfContent.toString('base64'),
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/MIME type/);
    });

    it('calls storage mock with correct path and data', async () => {
      await request()
        .post('/research/test-id/files')
        .set('Authorization', authHeader('admin'))
        .send(VALID_FILE_PAYLOAD);

      const files = getUploadedFiles();
      expect(files.length).toBe(1);
      expect(files[0].path).toContain('research/test-id/');
      expect(files[0].path).toContain('test.pdf');
    });

    it('stores file metadata in Firestore', async () => {
      await request()
        .post('/research/test-id/files')
        .set('Authorization', authHeader('admin'))
        .send(VALID_FILE_PAYLOAD);

      const attachments = getAllDocs('file-attachments');
      expect(attachments.length).toBe(1);
      expect(attachments[0].data.research_id).toBe('test-id');
      expect(attachments[0].data.file_type).toBe('application/pdf');
    });

    it('rejects read-only key', async () => {
      const res = await request()
        .post('/research/some-research/files')
        .set('Authorization', authHeader('read'))
        .send(VALID_FILE_PAYLOAD);

      expect(res.status).toBe(403);
    });

    it('skips magic byte validation for text types', async () => {
      const textPayload = {
        file_name: 'notes.md',
        file_type: 'text/markdown',
        file_data: Buffer.from('# Heading\nSome markdown').toString('base64'),
        source_id: null,
      };

      const res = await request()
        .post('/research/some-research/files')
        .set('Authorization', authHeader('read_write'))
        .send(textPayload);

      expect(res.status).toBe(201);
    });
  });

  // =========================================================================
  // GET /research/:id/files
  // =========================================================================
  describe('GET /research/:id/files', () => {
    it('returns files for a research item', async () => {
      seedCollection('file-attachments', {
        'file-1': {
          research_id: 'research-1',
          file_name: 'doc.pdf',
          file_type: 'application/pdf',
          uploaded_at: '2025-01-01T00:00:00.000Z',
        },
      });

      const res = await request()
        .get('/research/research-1/files')
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].file_name).toBe('doc.pdf');
    });

    it('returns empty array when no files exist', async () => {
      const res = await request()
        .get('/research/no-files/files')
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('allows all permission levels to list files', async () => {
      for (const level of ['read', 'read_write', 'admin'] as const) {
        const res = await request()
          .get('/research/any-id/files')
          .set('Authorization', authHeader(level));
        expect(res.status).toBe(200);
      }
    });
  });
});
