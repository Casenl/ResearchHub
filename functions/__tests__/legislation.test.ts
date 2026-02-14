import { describe, it, expect, beforeEach } from 'vitest';
import { request, authHeader, setupTest } from './helpers/test-utils';
import { seedCollection, getDoc, getAllDocs } from './helpers/mock-firestore';

const VALID_LEGISLATION_PAYLOAD = {
  name: 'NEN 7510',
  description: 'Dutch healthcare information security standard',
  market_ids: ['market-nl'],
  sector_ids: ['sector-hc'],
  scope: 'national' as const,
  effective_date: '2017-12-01',
  enforcement_authority: 'Dutch Healthcare Inspectorate (IGJ)',
  compliance_deadline: null,
  context_document_id: null,
  url: 'https://www.nen.nl/nen-7510',
  tags: ['healthcare', 'security'],
};

const SEEDED_LEGISLATION: Record<string, Record<string, unknown>> = {
  'leg-1': {
    name: 'DORA',
    description: 'Digital Operational Resilience Act',
    market_ids: ['market-nl', 'market-de'],
    sector_ids: ['sector-fs'],
    scope: 'eu',
    effective_date: '2023-01-16',
    enforcement_authority: 'ESAs',
    compliance_deadline: '2025-01-17',
    context_document_id: null,
    url: null,
    tags: ['financial-services'],
    created_by: 'agent-001',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
};

describe('Legislation Routes', () => {
  beforeEach(() => {
    setupTest();
  });

  // =========================================================================
  // POST /legislation
  // =========================================================================
  describe('POST /legislation', () => {
    it('creates legislation with read_write auth and returns 201', async () => {
      const res = await request()
        .post('/legislation')
        .set('Authorization', authHeader('read_write'))
        .send(VALID_LEGISLATION_PAYLOAD);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('NEN 7510');
      expect(res.body.scope).toBe('national');
    });

    it('creates legislation with admin auth', async () => {
      const res = await request()
        .post('/legislation')
        .set('Authorization', authHeader('admin'))
        .send(VALID_LEGISLATION_PAYLOAD);

      expect(res.status).toBe(201);
    });

    it('rejects read-only key', async () => {
      const res = await request()
        .post('/legislation')
        .set('Authorization', authHeader('read'))
        .send(VALID_LEGISLATION_PAYLOAD);

      expect(res.status).toBe(403);
    });

    it('rejects unauthenticated request', async () => {
      const res = await request().post('/legislation').send(VALID_LEGISLATION_PAYLOAD);
      expect(res.status).toBe(401);
    });

    it('returns 400 for missing required fields', async () => {
      const res = await request()
        .post('/legislation')
        .set('Authorization', authHeader('admin'))
        .send({ name: 'Missing fields' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Validation/);
    });

    it('applies default values', async () => {
      const minimal = {
        name: 'Minimal Legislation',
        market_ids: ['market-nl'],
        sector_ids: ['sector-hc'],
        scope: 'national',
        effective_date: '2025-01-01',
      };

      const res = await request()
        .post('/legislation')
        .set('Authorization', authHeader('admin'))
        .send(minimal);

      expect(res.status).toBe(201);
      expect(res.body.description).toBe('');
      expect(res.body.tags).toEqual([]);
      expect(res.body.compliance_deadline).toBeNull();
    });

    it('writes an audit log entry', async () => {
      await request()
        .post('/legislation')
        .set('Authorization', authHeader('admin'))
        .send(VALID_LEGISLATION_PAYLOAD);

      const logs = getAllDocs('audit_logs');
      const createLog = logs.find((l) => l.data.action === 'created');
      expect(createLog).toBeDefined();
      expect(createLog!.data.target_type).toBe('legislation');
    });
  });

  // =========================================================================
  // GET /legislation
  // =========================================================================
  describe('GET /legislation', () => {
    it('returns all legislation entries', async () => {
      seedCollection('legislation', SEEDED_LEGISLATION);

      const res = await request()
        .get('/legislation')
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.results[0].name).toBe('DORA');
    });

    it('returns empty list when no legislation exists', async () => {
      const res = await request()
        .get('/legislation')
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(0);
      expect(res.body.results).toEqual([]);
    });

    it('rejects unauthenticated request', async () => {
      const res = await request().get('/legislation');
      expect(res.status).toBe(401);
    });
  });

  // =========================================================================
  // GET /legislation/:id
  // =========================================================================
  describe('GET /legislation/:id', () => {
    it('returns a single legislation entry', async () => {
      seedCollection('legislation', SEEDED_LEGISLATION);

      const res = await request()
        .get('/legislation/leg-1')
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('DORA');
      expect(res.body.id).toBe('leg-1');
    });

    it('returns 404 for non-existent entry', async () => {
      const res = await request()
        .get('/legislation/non-existent')
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(404);
    });
  });

  // =========================================================================
  // PUT /legislation/:id
  // =========================================================================
  describe('PUT /legislation/:id', () => {
    it('updates legislation with read_write auth', async () => {
      seedCollection('legislation', SEEDED_LEGISLATION);

      const res = await request()
        .put('/legislation/leg-1')
        .set('Authorization', authHeader('read_write'))
        .send({ name: 'DORA v2', description: 'Updated' });

      expect(res.status).toBe(200);

      const updated = getDoc('legislation', 'leg-1');
      expect(updated?.name).toBe('DORA v2');
      expect(updated?.description).toBe('Updated');
    });

    it('returns 404 for non-existent entry', async () => {
      const res = await request()
        .put('/legislation/non-existent')
        .set('Authorization', authHeader('admin'))
        .send({ name: 'Updated' });

      expect(res.status).toBe(404);
    });

    it('rejects read-only key', async () => {
      seedCollection('legislation', SEEDED_LEGISLATION);

      const res = await request()
        .put('/legislation/leg-1')
        .set('Authorization', authHeader('read'))
        .send({ name: 'Updated' });

      expect(res.status).toBe(403);
    });
  });

  // =========================================================================
  // DELETE /legislation/:id
  // =========================================================================
  describe('DELETE /legislation/:id', () => {
    it('deletes legislation with admin auth', async () => {
      seedCollection('legislation', SEEDED_LEGISLATION);

      const res = await request()
        .delete('/legislation/leg-1')
        .set('Authorization', authHeader('admin'));

      expect(res.status).toBe(200);
      expect(getDoc('legislation', 'leg-1')).toBeUndefined();
    });

    it('rejects read_write key (admin only)', async () => {
      seedCollection('legislation', SEEDED_LEGISLATION);

      const res = await request()
        .delete('/legislation/leg-1')
        .set('Authorization', authHeader('read_write'));

      expect(res.status).toBe(403);
    });

    it('returns 404 for non-existent entry', async () => {
      const res = await request()
        .delete('/legislation/non-existent')
        .set('Authorization', authHeader('admin'));

      expect(res.status).toBe(404);
    });

    it('writes an audit log entry', async () => {
      seedCollection('legislation', SEEDED_LEGISLATION);

      await request()
        .delete('/legislation/leg-1')
        .set('Authorization', authHeader('admin'));

      const logs = getAllDocs('audit_logs');
      const deleteLog = logs.find((l) => l.data.action === 'deleted');
      expect(deleteLog).toBeDefined();
      expect(deleteLog!.data.target_type).toBe('legislation');
    });
  });
});
