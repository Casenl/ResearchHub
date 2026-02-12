import { describe, it, expect, beforeEach } from 'vitest';
import { request, authHeader, setupTest } from './helpers/test-utils';
import { seedCollection } from './helpers/mock-firestore';
import { hashKey, TEST_KEYS } from './helpers/fixtures';

describe('Auth Middleware', () => {
  beforeEach(() => {
    setupTest();
  });

  // Use GET /research as a representative authenticated endpoint
  const authedGet = () => request().get('/research');

  it('rejects requests without Authorization header', async () => {
    const res = await authedGet();
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Authorization/);
  });

  it('rejects requests with non-Bearer Authorization', async () => {
    const res = await authedGet().set('Authorization', 'Basic abc123');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Authorization/);
  });

  it('rejects Bearer with no token value', async () => {
    const res = await authedGet().set('Authorization', 'Bearer ');
    expect(res.status).toBe(401);
  });

  it('rejects token not found in Firestore', async () => {
    const res = await authedGet().set('Authorization', 'Bearer nonexistent-key');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Invalid/);
  });

  it('rejects expired API key', async () => {
    seedCollection('api-keys', {
      'key-expired': {
        name: 'Expired Key',
        key_hash: hashKey('expired-key-123'),
        permissions: 'admin',
        is_active: true,
        expires_at: '2020-01-01T00:00:00.000Z',
        agent_identity: {
          agent_id: 'agent-x',
          agent_name: 'Expired Agent',
          agent_version: '1.0.0',
          run_id: 'run-x',
        },
      },
    });

    const res = await authedGet().set('Authorization', 'Bearer expired-key-123');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/expired/);
  });

  it('rejects revoked (inactive) key', async () => {
    seedCollection('api-keys', {
      'key-revoked': {
        name: 'Revoked Key',
        key_hash: hashKey('revoked-key-123'),
        permissions: 'admin',
        is_active: false,
        expires_at: null,
        agent_identity: {
          agent_id: 'agent-x',
          agent_name: 'Revoked Agent',
          agent_version: '1.0.0',
          run_id: 'run-x',
        },
      },
    });

    const res = await authedGet().set('Authorization', 'Bearer revoked-key-123');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Invalid/);
  });

  it('passes with valid admin key', async () => {
    const res = await authedGet().set('Authorization', authHeader('admin'));
    expect(res.status).toBe(200);
  });

  it('passes with valid read_write key', async () => {
    const res = await authedGet().set('Authorization', authHeader('read_write'));
    expect(res.status).toBe(200);
  });

  it('passes with valid read key', async () => {
    const res = await authedGet().set('Authorization', authHeader('read'));
    expect(res.status).toBe(200);
  });

  it('returns 403 when read key accesses write endpoint', async () => {
    const res = await request()
      .post('/research')
      .set('Authorization', authHeader('read'))
      .send({ title: 'x' });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/permissions/i);
  });

  it('returns 403 when read_write key accesses admin endpoint', async () => {
    const res = await request()
      .delete('/research/some-id')
      .set('Authorization', authHeader('read_write'));

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/permissions/i);
  });

  it('attaches apiKey info to request (verified via response behavior)', async () => {
    // Create research as admin — the origin field is hardcoded to 'agent'
    // and author_id comes from req.apiKey.agent_identity.agent_id
    const res = await request()
      .post('/research')
      .set('Authorization', authHeader('admin'))
      .send({
        title: 'Auth Test',
        output_format: 'factsheet',
        origin: 'agent',
        dimensions: { market_ids: [], domain_ids: [], sector_ids: [] },
      });

    expect(res.status).toBe(201);
    expect(res.body.author_id).toBe('agent-001'); // from admin agent_identity
  });
});
