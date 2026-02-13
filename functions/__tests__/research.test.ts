import { describe, it, expect, beforeEach } from 'vitest';
import { request, authHeader, setupTest } from './helpers/test-utils';
import { seedCollection, getDoc, getAllDocs } from './helpers/mock-firestore';
import { VALID_RESEARCH_PAYLOAD, SEEDED_RESEARCH } from './helpers/fixtures';

describe('Research Routes', () => {
  beforeEach(() => {
    setupTest();
  });

  // =========================================================================
  // POST /research
  // =========================================================================
  describe('POST /research', () => {
    it('creates research with read_write auth and returns 201', async () => {
      const res = await request()
        .post('/research')
        .set('Authorization', authHeader('read_write'))
        .send(VALID_RESEARCH_PAYLOAD);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Test Research');
      expect(res.body.status).toBe('draft');
    });

    it('creates research with admin auth', async () => {
      const res = await request()
        .post('/research')
        .set('Authorization', authHeader('admin'))
        .send(VALID_RESEARCH_PAYLOAD);

      expect(res.status).toBe(201);
    });

    it('rejects read-only key', async () => {
      const res = await request()
        .post('/research')
        .set('Authorization', authHeader('read'))
        .send(VALID_RESEARCH_PAYLOAD);

      expect(res.status).toBe(403);
    });

    it('rejects unauthenticated request', async () => {
      const res = await request().post('/research').send(VALID_RESEARCH_PAYLOAD);

      expect(res.status).toBe(401);
    });

    it('returns 400 for missing required fields', async () => {
      const res = await request()
        .post('/research')
        .set('Authorization', authHeader('admin'))
        .send({ title: 'Missing fields' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Validation/);
    });

    it('applies default values', async () => {
      const minimal = {
        title: 'Minimal Research',
        output_format: 'factsheet',
        origin: 'agent',
        dimensions: { market_ids: [], domain_ids: [], sector_ids: [] },
      };

      const res = await request()
        .post('/research')
        .set('Authorization', authHeader('admin'))
        .send(minimal);

      expect(res.status).toBe(201);
      expect(res.body.type).toBe('new');
      expect(res.body.refresh_schedule).toBe('ad_hoc');
      expect(res.body.assumptions).toEqual([]);
      expect(res.body.notebooks).toEqual([]);
    });

    it('writes an audit log entry', async () => {
      await request()
        .post('/research')
        .set('Authorization', authHeader('admin'))
        .send(VALID_RESEARCH_PAYLOAD);

      const logs = getAllDocs('audit_logs');
      const createLog = logs.find((l) => l.data.action === 'created');
      expect(createLog).toBeDefined();
      expect(createLog!.data.target_type).toBe('research');
    });

    it('returns the full research document with id', async () => {
      const res = await request()
        .post('/research')
        .set('Authorization', authHeader('admin'))
        .send(VALID_RESEARCH_PAYLOAD);

      expect(res.body.id).toMatch(/^mock-id-/);
      expect(res.body.origin).toBe('agent');
      expect(res.body.review_status).toBe('pending');
      expect(res.body.created_at).toBeDefined();
      expect(res.body.updated_at).toBeDefined();
    });
  });

  // =========================================================================
  // Document ID validation
  // =========================================================================
  describe('Document ID validation', () => {
    it('rejects ID with dots in GET /:id', async () => {
      const res = await request()
        .get('/research/id.with.dots')
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(400);
    });

    it('rejects ID with special chars in PATCH /:id', async () => {
      const res = await request()
        .patch('/research/id@evil')
        .set('Authorization', authHeader('read_write'))
        .send({ title: 'X' });

      expect(res.status).toBe(400);
    });

    it('rejects ID with special chars in DELETE /:id', async () => {
      const res = await request()
        .delete('/research/id!drop')
        .set('Authorization', authHeader('admin'));

      expect(res.status).toBe(400);
    });
  });

  // =========================================================================
  // GET /research/:id
  // =========================================================================
  describe('GET /research/:id', () => {
    beforeEach(() => {
      seedCollection('research', SEEDED_RESEARCH);
    });

    it('returns 200 with existing research', async () => {
      const res = await request()
        .get('/research/research-1')
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('research-1');
      expect(res.body.title).toBe('Netherlands Cloud Research');
    });

    it('returns 404 for non-existing research', async () => {
      const res = await request()
        .get('/research/nonexistent')
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/not found/i);
    });

    it('allows all permission levels to read', async () => {
      for (const level of ['read', 'read_write', 'admin'] as const) {
        const res = await request()
          .get('/research/research-1')
          .set('Authorization', authHeader(level));
        expect(res.status).toBe(200);
      }
    });
  });

  // =========================================================================
  // GET /research (query)
  // =========================================================================
  describe('GET /research', () => {
    beforeEach(() => {
      seedCollection('research', SEEDED_RESEARCH);
    });

    it('returns results with default pagination', async () => {
      const res = await request()
        .get('/research')
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('results');
      expect(res.body.limit).toBe(20);
      expect(res.body.offset).toBe(0);
    });

    it('filters by origin', async () => {
      const res = await request()
        .get('/research')
        .query({ origin: 'agent' })
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(200);
      for (const r of res.body.results) {
        expect(r.origin).toBe('agent');
      }
    });

    it('filters by status', async () => {
      const res = await request()
        .get('/research')
        .query({ status: 'draft' })
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(200);
      for (const r of res.body.results) {
        expect(r.status).toBe('draft');
      }
    });

    it('respects limit and offset', async () => {
      const res = await request()
        .get('/research')
        .query({ limit: '1', offset: '0' })
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(200);
      expect(res.body.results.length).toBeLessThanOrEqual(1);
    });
  });

  // =========================================================================
  // PATCH /research/:id
  // =========================================================================
  describe('PATCH /research/:id', () => {
    beforeEach(() => {
      seedCollection('research', SEEDED_RESEARCH);
    });

    it('updates research successfully', async () => {
      const res = await request()
        .patch('/research/research-1')
        .set('Authorization', authHeader('read_write'))
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/updated/i);

      const doc = getDoc('research', 'research-1');
      expect(doc?.title).toBe('Updated Title');
    });

    it('returns 404 for non-existing research', async () => {
      const res = await request()
        .patch('/research/nonexistent')
        .set('Authorization', authHeader('read_write'))
        .send({ title: 'X' });

      expect(res.status).toBe(404);
    });

    it('rejects read-only key', async () => {
      const res = await request()
        .patch('/research/research-1')
        .set('Authorization', authHeader('read'))
        .send({ title: 'X' });

      expect(res.status).toBe(403);
    });

    it('sets updated_at timestamp', async () => {
      const before = new Date().toISOString();
      await request()
        .patch('/research/research-1')
        .set('Authorization', authHeader('admin'))
        .send({ title: 'Timestamped' });

      const doc = getDoc('research', 'research-1');
      expect(doc?.updated_at).toBeDefined();
      expect(String(doc?.updated_at) >= before).toBe(true);
    });
  });

  // =========================================================================
  // DELETE /research/:id
  // =========================================================================
  describe('DELETE /research/:id', () => {
    beforeEach(() => {
      seedCollection('research', SEEDED_RESEARCH);
    });

    it('archives research with admin key', async () => {
      const res = await request()
        .delete('/research/research-1')
        .set('Authorization', authHeader('admin'));

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/archived/i);

      const doc = getDoc('research', 'research-1');
      expect(doc?.status).toBe('archived');
    });

    it('returns 404 for non-existing research', async () => {
      const res = await request()
        .delete('/research/nonexistent')
        .set('Authorization', authHeader('admin'));

      expect(res.status).toBe(404);
    });

    it('rejects non-admin keys', async () => {
      const res = await request()
        .delete('/research/research-1')
        .set('Authorization', authHeader('read_write'));

      expect(res.status).toBe(403);
    });
  });
});
