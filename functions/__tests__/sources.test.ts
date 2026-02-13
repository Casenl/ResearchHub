import { describe, it, expect, beforeEach } from 'vitest';
import { request, authHeader, setupTest } from './helpers/test-utils';
import { seedCollection, getDoc, getAllDocs } from './helpers/mock-firestore';
import { VALID_SOURCE_PAYLOAD, SEEDED_RESEARCH } from './helpers/fixtures';

describe('Sources Routes', () => {
  beforeEach(() => {
    setupTest();
    seedCollection('research', SEEDED_RESEARCH);
  });

  // =========================================================================
  // POST /research/:id/sources
  // =========================================================================
  describe('POST /research/:id/sources', () => {
    it('adds a source to a notebook and returns 201', async () => {
      const res = await request()
        .post('/research/research-1/sources')
        .set('Authorization', authHeader('read_write'))
        .send(VALID_SOURCE_PAYLOAD);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Test Source');
      expect(res.body.validation_status).toBe('unverified');
    });

    it('returns 400 when notebook_id is missing', async () => {
      const { notebook_id: _, ...noNotebook } = VALID_SOURCE_PAYLOAD;
      const res = await request()
        .post('/research/research-1/sources')
        .set('Authorization', authHeader('read_write'))
        .send(noNotebook);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/notebook_id/);
    });

    it('returns 404 when research not found', async () => {
      const res = await request()
        .post('/research/nonexistent/sources')
        .set('Authorization', authHeader('read_write'))
        .send(VALID_SOURCE_PAYLOAD);

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/Research not found/);
    });

    it('returns 404 when notebook not found', async () => {
      const res = await request()
        .post('/research/research-1/sources')
        .set('Authorization', authHeader('read_write'))
        .send({ ...VALID_SOURCE_PAYLOAD, notebook_id: 'nb-nonexistent' });

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/Notebook not found/);
    });

    it('returns 400 for invalid source data', async () => {
      const res = await request()
        .post('/research/research-1/sources')
        .set('Authorization', authHeader('read_write'))
        .send({ notebook_id: 'nb-1', title: '' }); // title min 1

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Validation/);
    });

    it('rejects read-only key', async () => {
      const res = await request()
        .post('/research/research-1/sources')
        .set('Authorization', authHeader('read'))
        .send(VALID_SOURCE_PAYLOAD);

      expect(res.status).toBe(403);
    });

    it('appends source to the notebook sources array', async () => {
      await request()
        .post('/research/research-1/sources')
        .set('Authorization', authHeader('admin'))
        .send(VALID_SOURCE_PAYLOAD);

      const doc = getDoc('research', 'research-1');
      const notebooks = doc?.notebooks as Array<Record<string, unknown>>;
      const nb = notebooks.find((n) => n.id === 'nb-1');
      const sources = nb?.sources as unknown[];
      // Original had 1 source, now should have 2
      expect(sources.length).toBe(2);
    });
  });

  // =========================================================================
  // PATCH /research/:id/sources/:sourceId
  // =========================================================================
  describe('PATCH /research/:id/sources/:sourceId', () => {
    it('updates a source', async () => {
      const res = await request()
        .patch('/research/research-1/sources/src-1')
        .set('Authorization', authHeader('read_write'))
        .send({ title: 'Updated Source Title' });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/updated/i);
    });

    it('returns 404 when source not found', async () => {
      const res = await request()
        .patch('/research/research-1/sources/nonexistent')
        .set('Authorization', authHeader('read_write'))
        .send({ title: 'X' });

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/Source not found/);
    });

    it('returns 404 when research not found', async () => {
      const res = await request()
        .patch('/research/nonexistent/sources/src-1')
        .set('Authorization', authHeader('read_write'))
        .send({ title: 'X' });

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/Research not found/);
    });

    it('rejects invalid URL in update via schema validation', async () => {
      const res = await request()
        .patch('/research/research-1/sources/src-1')
        .set('Authorization', authHeader('read_write'))
        .send({ url: 'not-a-url' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Validation/);
    });

    it('rejects title over 300 characters', async () => {
      const res = await request()
        .patch('/research/research-1/sources/src-1')
        .set('Authorization', authHeader('read_write'))
        .send({ title: 'x'.repeat(301) });

      expect(res.status).toBe(400);
    });

    it('rejects invalid research ID with special characters', async () => {
      const res = await request()
        .patch('/research/id.evil/sources/src-1')
        .set('Authorization', authHeader('read_write'))
        .send({ title: 'X' });

      expect(res.status).toBe(400);
    });
  });

  // =========================================================================
  // POST /research/:id/sources/:sourceId/validate
  // =========================================================================
  describe('POST /research/:id/sources/:sourceId/validate', () => {
    it('adjusts tier down by 2 for corroborated', async () => {
      const res = await request()
        .post('/research/research-1/sources/src-1/validate')
        .set('Authorization', authHeader('read_write'))
        .send({ validation_status: 'corroborated' });

      expect(res.status).toBe(200);
      // Original tier was 4, corroborated = -2 -> 2
      expect(res.body.new_tier).toBe(2);
      expect(res.body.new_status).toBe('corroborated');
    });

    it('adjusts tier down by 3 for human_verified', async () => {
      const res = await request()
        .post('/research/research-1/sources/src-1/validate')
        .set('Authorization', authHeader('read_write'))
        .send({ validation_status: 'human_verified' });

      expect(res.status).toBe(200);
      // Original tier was 4, human_verified = -3 -> 1
      expect(res.body.new_tier).toBe(1);
    });

    it('adjusts tier up by 2 for disputed', async () => {
      const res = await request()
        .post('/research/research-1/sources/src-1/validate')
        .set('Authorization', authHeader('read_write'))
        .send({ validation_status: 'disputed' });

      expect(res.status).toBe(200);
      // Original tier was 4, disputed = +2 -> 6
      expect(res.body.new_tier).toBe(6);
    });

    it('enforces tier floor of 1', async () => {
      // Set source tier to 1
      const doc = getDoc('research', 'research-1');
      const notebooks = doc?.notebooks as Array<Record<string, unknown>>;
      const sources = notebooks[0].sources as Array<Record<string, unknown>>;
      sources[0].quality_tier = 1;

      const res = await request()
        .post('/research/research-1/sources/src-1/validate')
        .set('Authorization', authHeader('read_write'))
        .send({ validation_status: 'corroborated' });

      expect(res.status).toBe(200);
      expect(res.body.new_tier).toBe(1); // max(1, 1-2) = 1
    });

    it('enforces tier ceiling of 8', async () => {
      // Set source tier to 7
      const doc = getDoc('research', 'research-1');
      const notebooks = doc?.notebooks as Array<Record<string, unknown>>;
      const sources = notebooks[0].sources as Array<Record<string, unknown>>;
      sources[0].quality_tier = 7;

      const res = await request()
        .post('/research/research-1/sources/src-1/validate')
        .set('Authorization', authHeader('read_write'))
        .send({ validation_status: 'disputed' });

      expect(res.status).toBe(200);
      expect(res.body.new_tier).toBe(8); // min(8, 7+2) = 8
    });

    it('writes an audit log entry', async () => {
      await request()
        .post('/research/research-1/sources/src-1/validate')
        .set('Authorization', authHeader('admin'))
        .send({ validation_status: 'corroborated', validation_notes: 'Confirmed' });

      const logs = getAllDocs('audit_logs');
      const validateLog = logs.find((l) => l.data.action === 'source_validated');
      expect(validateLog).toBeDefined();
      expect(validateLog!.data.target_id).toBe('src-1');
    });

    it('returns 404 when source not found', async () => {
      const res = await request()
        .post('/research/research-1/sources/nonexistent/validate')
        .set('Authorization', authHeader('read_write'))
        .send({ validation_status: 'corroborated' });

      expect(res.status).toBe(404);
    });
  });
});
