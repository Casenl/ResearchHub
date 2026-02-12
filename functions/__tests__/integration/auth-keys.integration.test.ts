import { describe, it, expect, beforeAll } from 'vitest';
import { apiFetch, readTestState, TEST_PREFIX, type TestState } from './helpers';

let state: TestState;

beforeAll(() => {
  state = readTestState();
});

describe('API key lifecycle (integration)', () => {
  let createdKeyId: string;
  let createdKeyPlaintext: string;

  it('POST /auth/keys creates a new API key', async () => {
    const { status, body } = await apiFetch('/auth/keys', {
      method: 'POST',
      body: JSON.stringify({
        name: `${TEST_PREFIX}_lifecycle_key`,
        permissions: 'read',
        agent_identity: {
          agent_id: 'lifecycle-test',
          agent_name: 'Lifecycle Test Agent',
          agent_version: '1.0.0',
          run_id: `lifecycle-${Date.now()}`,
        },
        expires_at: null,
      }),
      apiKey: state.adminKey,
    });

    expect(status).toBe(201);
    expect(body).toHaveProperty('key_id');
    expect(body).toHaveProperty('plaintext_key');
    expect(typeof body.plaintext_key).toBe('string');
    expect((body.plaintext_key as string).startsWith('rh_')).toBe(true);

    createdKeyId = body.key_id as string;
    createdKeyPlaintext = body.plaintext_key as string;
  });

  it('newly created key can authenticate a request', async () => {
    const { status, body } = await apiFetch('/research?limit=1', {
      apiKey: createdKeyPlaintext,
    });

    expect(status).toBe(200);
    expect(body).toHaveProperty('results');
  });

  it('GET /auth/keys lists keys without exposing hashes', async () => {
    const { status, body } = await apiFetch('/auth/keys', {
      apiKey: state.adminKey,
    });

    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);

    const keys = body as unknown as Array<Record<string, unknown>>;
    const created = keys.find((k) => k.id === createdKeyId);
    expect(created).toBeDefined();
    expect(created!.name).toContain(TEST_PREFIX);
    // key_hash must never be exposed
    expect(created).not.toHaveProperty('key_hash');
  });

  it('non-admin key cannot list keys', async () => {
    const { status } = await apiFetch('/auth/keys', {
      apiKey: state.readKey,
    });

    expect(status).toBe(403);
  });

  it('non-admin key cannot create keys', async () => {
    const { status } = await apiFetch('/auth/keys', {
      method: 'POST',
      body: JSON.stringify({
        name: `${TEST_PREFIX}_unauthorized`,
        permissions: 'read',
        agent_identity: {
          agent_id: 'test',
          agent_name: 'Test',
          agent_version: '1.0.0',
          run_id: 'test',
        },
      }),
      apiKey: state.readWriteKey,
    });

    expect(status).toBe(403);
  });

  it('DELETE /auth/keys/:id revokes the key', async () => {
    const { status, body } = await apiFetch(`/auth/keys/${createdKeyId}`, {
      method: 'DELETE',
      apiKey: state.adminKey,
    });

    expect(status).toBe(200);
    expect(body.message).toBe('Key revoked');
  });

  it('revoked key can no longer authenticate', async () => {
    const { status } = await apiFetch('/research?limit=1', {
      apiKey: createdKeyPlaintext,
    });

    expect(status).toBe(401);
  });
});
