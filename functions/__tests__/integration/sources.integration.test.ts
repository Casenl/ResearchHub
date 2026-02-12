import { describe, it, expect, beforeAll } from 'vitest';
import {
  apiFetch,
  readTestState,
  makeSourcePayload,
  TEST_PREFIX,
  type TestState,
} from './helpers';

let state: TestState;

beforeAll(() => {
  state = readTestState();
});

describe('Sources (integration)', () => {
  let addedSourceId: string;

  it('POST /:id/sources adds a source to a notebook', async () => {
    const payload = {
      ...makeSourcePayload({ title: `${TEST_PREFIX} Added Source` }),
      notebook_id: state.notebookId,
    };

    const { status, body } = await apiFetch(
      `/research/${state.researchId}/sources`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
        apiKey: state.readWriteKey,
      },
    );

    expect(status).toBe(201);
    expect(body).toHaveProperty('id');
    expect(body.title).toContain(TEST_PREFIX);
    addedSourceId = body.id as string;
  });

  it('GET /:id confirms the added source persists in the notebook', async () => {
    const { status, body } = await apiFetch(
      `/research/${state.researchId}`,
      { apiKey: state.readKey },
    );

    expect(status).toBe(200);
    const notebooks = body.notebooks as Array<Record<string, unknown>>;
    const nb = notebooks.find((n) => n.id === state.notebookId);
    expect(nb).toBeDefined();

    const sources = nb!.sources as Array<Record<string, unknown>>;
    const src = sources.find((s) => s.id === addedSourceId);
    expect(src).toBeDefined();
    expect(src!.title).toContain(TEST_PREFIX);
  });

  it('POST /:id/sources/:sourceId/validate adjusts quality tier', async () => {
    const { status, body } = await apiFetch(
      `/research/${state.researchId}/sources/${addedSourceId}/validate`,
      {
        method: 'POST',
        body: JSON.stringify({
          validation_status: 'corroborated',
          validation_notes: 'Integration test validation',
        }),
        apiKey: state.readWriteKey,
      },
    );

    expect(status).toBe(200);
    expect(body.new_status).toBe('corroborated');
    // corroborated reduces tier by 2 (4 -> 2)
    expect(body.new_tier).toBe(2);
  });

  it('validated source shows updated tier in GET', async () => {
    const { body } = await apiFetch(`/research/${state.researchId}`, {
      apiKey: state.readKey,
    });

    const notebooks = body.notebooks as Array<Record<string, unknown>>;
    const nb = notebooks.find((n) => n.id === state.notebookId);
    const sources = nb!.sources as Array<Record<string, unknown>>;
    const src = sources.find((s) => s.id === addedSourceId);

    expect(src!.quality_tier).toBe(2);
    expect(src!.validation_status).toBe('corroborated');
  });

  it('returns 404 for source on non-existent research', async () => {
    const { status } = await apiFetch(
      '/research/nonexistent-id/sources',
      {
        method: 'POST',
        body: JSON.stringify({
          ...makeSourcePayload(),
          notebook_id: 'some-nb',
        }),
        apiKey: state.readWriteKey,
      },
    );

    expect(status).toBe(404);
  });

  it('returns 404 for non-existent notebook_id', async () => {
    const { status } = await apiFetch(
      `/research/${state.researchId}/sources`,
      {
        method: 'POST',
        body: JSON.stringify({
          ...makeSourcePayload(),
          notebook_id: 'nonexistent-notebook',
        }),
        apiKey: state.readWriteKey,
      },
    );

    expect(status).toBe(404);
  });
});
