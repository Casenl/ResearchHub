import { describe, it, expect, beforeEach } from 'vitest';
import { request, authHeader, setupTest } from './helpers/test-utils';
import { seedCollection, getDoc, getAllDocs } from './helpers/mock-firestore';
import { VALID_API_KEY_PAYLOAD } from './helpers/fixtures';

describe('Auth Keys Routes', () => {
  beforeEach(() => {
    setupTest();
  });

  // =========================================================================
  // POST /auth/keys
  // =========================================================================
  describe('POST /auth/keys', () => {
    it('creates a key with rh_ prefix and returns 201', async () => {
      const res = await request()
        .post('/auth/keys')
        .set('Authorization', authHeader('admin'))
        .send(VALID_API_KEY_PAYLOAD);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('key_id');
      expect(res.body).toHaveProperty('plaintext_key');
      expect(res.body.plaintext_key).toMatch(/^rh_/);
      expect(res.body.name).toBe('New Test Key');
      expect(res.body.permissions).toBe('read_write');
    });

    it('rejects non-admin key', async () => {
      const res = await request()
        .post('/auth/keys')
        .set('Authorization', authHeader('read_write'))
        .send(VALID_API_KEY_PAYLOAD);

      expect(res.status).toBe(403);
    });

    it('returns 400 for invalid payload', async () => {
      const res = await request()
        .post('/auth/keys')
        .set('Authorization', authHeader('admin'))
        .send({ name: '' }); // empty name, missing fields

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Validation/);
    });

    it('stores hash in Firestore, not plaintext', async () => {
      const res = await request()
        .post('/auth/keys')
        .set('Authorization', authHeader('admin'))
        .send(VALID_API_KEY_PAYLOAD);

      const keyId = res.body.key_id;
      const doc = getDoc('api-keys', keyId);
      expect(doc).toBeDefined();
      expect(doc?.key_hash).toBeDefined();
      // key_hash should NOT equal the plaintext key
      expect(doc?.key_hash).not.toBe(res.body.plaintext_key);
      // key_hash should be a hex SHA256 (64 chars)
      expect(String(doc?.key_hash)).toHaveLength(64);
    });

    it('returns plaintext key in response (only time it is visible)', async () => {
      const res = await request()
        .post('/auth/keys')
        .set('Authorization', authHeader('admin'))
        .send(VALID_API_KEY_PAYLOAD);

      expect(res.body.plaintext_key).toBeDefined();
      expect(res.body.plaintext_key.length).toBeGreaterThan(10);
    });

    it('writes an audit log', async () => {
      await request()
        .post('/auth/keys')
        .set('Authorization', authHeader('admin'))
        .send(VALID_API_KEY_PAYLOAD);

      const logs = getAllDocs('audit_logs');
      const createLog = logs.find((l) => l.data.action === 'api_key_created');
      expect(createLog).toBeDefined();
    });
  });

  // =========================================================================
  // GET /auth/keys
  // =========================================================================
  describe('GET /auth/keys', () => {
    it('returns list with admin key', async () => {
      const res = await request()
        .get('/auth/keys')
        .set('Authorization', authHeader('admin'));

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Should include the seeded API keys
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('rejects non-admin key', async () => {
      const res = await request()
        .get('/auth/keys')
        .set('Authorization', authHeader('read_write'));

      expect(res.status).toBe(403);
    });

    it('excludes key_hash from response', async () => {
      const res = await request()
        .get('/auth/keys')
        .set('Authorization', authHeader('admin'));

      expect(res.status).toBe(200);
      for (const key of res.body) {
        expect(key).not.toHaveProperty('key_hash');
      }
    });

    it('returns all key metadata fields', async () => {
      const res = await request()
        .get('/auth/keys')
        .set('Authorization', authHeader('admin'));

      const key = res.body[0];
      expect(key).toHaveProperty('id');
      expect(key).toHaveProperty('name');
      expect(key).toHaveProperty('permissions');
      expect(key).toHaveProperty('agent_identity');
      expect(key).toHaveProperty('is_active');
    });
  });

  // =========================================================================
  // DELETE /auth/keys/:id
  // =========================================================================
  describe('DELETE /auth/keys/:id', () => {
    it('revokes an existing key', async () => {
      const res = await request()
        .delete('/auth/keys/key-admin')
        .set('Authorization', authHeader('admin'));

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/revoked/i);

      const doc = getDoc('api-keys', 'key-admin');
      expect(doc?.is_active).toBe(false);
    });

    it('returns 404 for non-existing key', async () => {
      const res = await request()
        .delete('/auth/keys/nonexistent')
        .set('Authorization', authHeader('admin'));

      expect(res.status).toBe(404);
    });

    it('rejects non-admin key', async () => {
      const res = await request()
        .delete('/auth/keys/key-admin')
        .set('Authorization', authHeader('read_write'));

      expect(res.status).toBe(403);
    });
  });
});
