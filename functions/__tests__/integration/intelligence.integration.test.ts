import { describe, it, expect, beforeAll } from 'vitest';
import { apiFetch, readTestState, type TestState } from './helpers';

let state: TestState;

beforeAll(() => {
  state = readTestState();
});

describe('Intelligence endpoints (integration)', () => {
  it('GET /intelligence/competitors returns correct shape', async () => {
    const { status, body } = await apiFetch(
      '/intelligence/competitors?region=NL',
      { apiKey: state.readKey },
    );

    expect(status).toBe(200);
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('competitors');
    expect(Array.isArray(body.competitors)).toBe(true);

    // Seeded research should appear since it has market NL
    if ((body.total as number) > 0) {
      const competitor = (body.competitors as Array<Record<string, unknown>>)[0];
      expect(competitor).toHaveProperty('name');
      expect(competitor).toHaveProperty('region');
      expect(competitor).toHaveProperty('trust_tier');
      expect(competitor).toHaveProperty('source_count');
      expect(competitor).toHaveProperty('research_id');
    }
  });

  it('GET /intelligence/landscape returns domain groupings', async () => {
    const { status, body } = await apiFetch(
      '/intelligence/landscape?region=NL',
      { apiKey: state.readKey },
    );

    expect(status).toBe(200);
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('landscape');
    expect(Array.isArray(body.landscape)).toBe(true);

    if ((body.total as number) > 0) {
      const entry = (body.landscape as Array<Record<string, unknown>>)[0];
      expect(entry).toHaveProperty('region');
      expect(entry).toHaveProperty('domain');
      expect(entry).toHaveProperty('research_count');
      expect(entry).toHaveProperty('avg_trust_tier');
    }
  });

  it('GET /intelligence/summary returns narrative format', async () => {
    const { status, body } = await apiFetch(
      '/intelligence/summary?region=NL',
      { apiKey: state.readKey },
    );

    expect(status).toBe(200);
    expect(body).toHaveProperty('content');
    expect(body).toHaveProperty('metadata');
    expect(typeof body.content).toBe('string');

    const metadata = body.metadata as Record<string, unknown>;
    expect(metadata.region).toBe('NL');
  });

  it('GET /intelligence/summary?format=structured returns array', async () => {
    const { status, body } = await apiFetch(
      '/intelligence/summary?region=NL&format=structured',
      { apiKey: state.readKey },
    );

    expect(status).toBe(200);
    expect(body).toHaveProperty('content');
    expect(Array.isArray(body.content)).toBe(true);
  });

  it('missing region returns 400', async () => {
    const { status, body } = await apiFetch('/intelligence/competitors', {
      apiKey: state.readKey,
    });

    expect(status).toBe(400);
    expect(body.error).toContain('region');
  });
});
