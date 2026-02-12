import { describe, it, expect, beforeEach } from 'vitest';
import { request, authHeader, setupTest } from './helpers/test-utils';
import { seedCollection } from './helpers/mock-firestore';
import { INTELLIGENCE_RESEARCH } from './helpers/fixtures';

describe('Intelligence Routes', () => {
  beforeEach(() => {
    setupTest();
    seedCollection('research', INTELLIGENCE_RESEARCH);
  });

  // =========================================================================
  // GET /intelligence/competitors
  // =========================================================================
  describe('GET /intelligence/competitors', () => {
    it('returns competitors for a valid region', async () => {
      const res = await request()
        .get('/intelligence/competitors')
        .query({ region: 'NL' })
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('competitors');
      // Should find non-archived NL research
      expect(res.body.total).toBe(2);
    });

    it('returns 400 when region is missing', async () => {
      const res = await request()
        .get('/intelligence/competitors')
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/region/);
    });

    it('returns empty array for region with no research', async () => {
      const res = await request()
        .get('/intelligence/competitors')
        .query({ region: 'XX' })
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(0);
      expect(res.body.competitors).toEqual([]);
    });

    it('filters by domain', async () => {
      const res = await request()
        .get('/intelligence/competitors')
        .query({ region: 'NL', domain: 'CLOUD' })
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.competitors[0].name).toBe('Intel Research NL Cloud');
    });
  });

  // =========================================================================
  // GET /intelligence/landscape
  // =========================================================================
  describe('GET /intelligence/landscape', () => {
    it('returns landscape grouped by domain', async () => {
      const res = await request()
        .get('/intelligence/landscape')
        .query({ region: 'NL' })
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('landscape');
      // Two domains: CLOUD and SEC
      expect(res.body.total).toBe(2);
    });

    it('returns 400 when region is missing', async () => {
      const res = await request()
        .get('/intelligence/landscape')
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/region/);
    });
  });

  // =========================================================================
  // GET /intelligence/summary
  // =========================================================================
  describe('GET /intelligence/summary', () => {
    it('returns narrative format by default', async () => {
      const res = await request()
        .get('/intelligence/summary')
        .query({ region: 'NL' })
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('content');
      expect(res.body).toHaveProperty('metadata');
      expect(typeof res.body.content).toBe('string');
      expect(res.body.content).toContain('Research Brief');
    });

    it('returns structured format when requested', async () => {
      const res = await request()
        .get('/intelligence/summary')
        .query({ region: 'NL', format: 'structured' })
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.content)).toBe(true);
      expect(res.body.content[0]).toHaveProperty('id');
      expect(res.body.content[0]).toHaveProperty('title');
    });

    it('returns 400 when region is missing', async () => {
      const res = await request()
        .get('/intelligence/summary')
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(400);
    });

    it('filters by domain', async () => {
      const res = await request()
        .get('/intelligence/summary')
        .query({ region: 'NL', domain: 'CLOUD', format: 'structured' })
        .set('Authorization', authHeader('read'));

      expect(res.status).toBe(200);
      expect(res.body.metadata.domain).toBe('CLOUD');
      // Only one CLOUD entry
      expect(res.body.content.length).toBe(1);
    });
  });
});
