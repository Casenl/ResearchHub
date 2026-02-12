import { describe, it, expect } from 'vitest';
import { request } from './helpers/test-utils';

describe('GET /health', () => {
  it('returns 200 with status ok and timestamp', async () => {
    const res = await request().get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('works without an Authorization header', async () => {
    const res = await request().get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('returns a valid ISO timestamp', async () => {
    const res = await request().get('/health');

    const ts = new Date(res.body.timestamp);
    expect(ts.toISOString()).toBe(res.body.timestamp);
  });
});
