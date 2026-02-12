import { describe, it, expect, beforeAll } from 'vitest';
import {
  apiFetch,
  readTestState,
  makeResearchPayload,
  TEST_PREFIX,
  type TestState,
} from './helpers';

let state: TestState;

beforeAll(() => {
  state = readTestState();
});

describe('Research CRUD (integration)', () => {
  let createdId: string;

  it('POST /research creates a real document', async () => {
    const payload = makeResearchPayload({
      title: `${TEST_PREFIX} Created Research`,
    });

    const { status, body } = await apiFetch('/research', {
      method: 'POST',
      body: JSON.stringify(payload),
      apiKey: state.readWriteKey,
    });

    expect(status).toBe(201);
    expect(body).toHaveProperty('id');
    expect(body.title).toBe(payload.title);
    createdId = body.id as string;
  });

  it('GET /research/:id retrieves the created document', async () => {
    const { status, body } = await apiFetch(`/research/${createdId}`, {
      apiKey: state.readKey,
    });

    expect(status).toBe(200);
    expect(body.id).toBe(createdId);
    expect(body.title).toContain(TEST_PREFIX);
  });

  it('GET /research returns results with filters', async () => {
    const { status, body } = await apiFetch('/research?status=draft&limit=5', {
      apiKey: state.readKey,
    });

    expect(status).toBe(200);
    expect(body).toHaveProperty('results');
    expect(body).toHaveProperty('total');
    expect(Array.isArray(body.results)).toBe(true);
  });

  it('GET /research filters by origin', async () => {
    const { status, body } = await apiFetch('/research?origin=agent', {
      apiKey: state.readKey,
    });

    expect(status).toBe(200);
    const results = body.results as Array<Record<string, unknown>>;
    for (const r of results) {
      expect(r.origin).toBe('agent');
    }
  });

  it('PATCH /research/:id updates and persists change', async () => {
    const updatedTitle = `${TEST_PREFIX} Updated Research`;

    const { status: patchStatus } = await apiFetch(`/research/${createdId}`, {
      method: 'PATCH',
      body: JSON.stringify({ title: updatedTitle }),
      apiKey: state.readWriteKey,
    });

    expect(patchStatus).toBe(200);

    // Re-fetch to confirm
    const { body } = await apiFetch(`/research/${createdId}`, {
      apiKey: state.readKey,
    });

    expect(body.title).toBe(updatedTitle);
  });

  it('DELETE /research/:id archives the document', async () => {
    const { status } = await apiFetch(`/research/${createdId}`, {
      method: 'DELETE',
      apiKey: state.adminKey,
    });

    expect(status).toBe(200);

    // Verify status is now archived
    const { body } = await apiFetch(`/research/${createdId}`, {
      apiKey: state.readKey,
    });

    expect(body.status).toBe('archived');
  });

  it('GET /research/:id returns 404 for non-existent ID', async () => {
    const { status } = await apiFetch('/research/nonexistent-id-12345', {
      apiKey: state.readKey,
    });

    expect(status).toBe(404);
  });

  // -----------------------------------------------------------------------
  // Permission enforcement
  // -----------------------------------------------------------------------

  it('read-only key cannot create research', async () => {
    const payload = makeResearchPayload({
      title: `${TEST_PREFIX} Should Not Be Created`,
    });

    const { status } = await apiFetch('/research', {
      method: 'POST',
      body: JSON.stringify(payload),
      apiKey: state.readKey,
    });

    expect(status).toBe(403);
  });

  it('read-only key cannot update research', async () => {
    const { status } = await apiFetch(`/research/${state.researchId}`, {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Unauthorized update' }),
      apiKey: state.readKey,
    });

    expect(status).toBe(403);
  });

  it('non-admin key cannot delete research', async () => {
    const { status } = await apiFetch(`/research/${state.researchId}`, {
      method: 'DELETE',
      apiKey: state.readWriteKey,
    });

    expect(status).toBe(403);
  });
});
