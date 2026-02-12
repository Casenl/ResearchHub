import { describe, it, expect } from 'vitest';
import { STAGING_API_URL } from './helpers';

describe('Health endpoint (integration)', () => {
  it('returns 200 from deployed function', async () => {
    const response = await fetch(`${STAGING_API_URL}/health`);
    expect(response.status).toBe(200);
  });

  it('returns valid structure with status and timestamp', async () => {
    const response = await fetch(`${STAGING_API_URL}/health`);
    const body = await response.json();

    expect(body).toHaveProperty('status', 'ok');
    expect(body).toHaveProperty('timestamp');
    expect(typeof body.timestamp).toBe('string');
    expect(new Date(body.timestamp).getTime()).not.toBeNaN();
  });
});
