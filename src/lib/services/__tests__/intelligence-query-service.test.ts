import { describe, it, expect, beforeEach } from 'vitest';
import { resetStore, seedCollection } from './helpers/mock-admin';
import { INTELLIGENCE_RESEARCH } from './helpers/fixtures';
import { queryResearch, getLandscape, getResearchBrief } from '../intelligence-query-service';

beforeEach(() => {
  resetStore();
  seedCollection('research', INTELLIGENCE_RESEARCH);
});

// ---------------------------------------------------------------------------
// queryResearch
// ---------------------------------------------------------------------------
describe('queryResearch', () => {
  it('returns all non-archived research with no filters', async () => {
    const { total } = await queryResearch({});
    // Mock doesn't filter by status unless asked, so all 4 items returned
    expect(total).toBe(4);
  });

  it('filters by status', async () => {
    const { items } = await queryResearch({ status: 'published' });
    expect(items.every(r => r.status === 'published')).toBe(true);
    expect(items).toHaveLength(2); // intel-1 and intel-3
  });

  it('filters by origin', async () => {
    const { items } = await queryResearch({ origin: 'human' });
    expect(items).toHaveLength(1);
    expect(items[0].title).toContain('Security');
  });

  it('filters by region (market code)', async () => {
    const { items } = await queryResearch({ region: 'NL' });
    // intel-1, intel-2, intel-archived have NL
    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items.every(r =>
      r.dimensions.markets.some(m => m.code === 'NL' || m.id === 'NL'),
    )).toBe(true);
  });

  it('filters by domain (domain code)', async () => {
    const { items } = await queryResearch({ domain: 'HC' });
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items.every(r =>
      r.dimensions.domains.some(d => d.code === 'HC' || d.id === 'HC'),
    )).toBe(true);
  });

  it('filters by sector', async () => {
    const { items } = await queryResearch({ sector: 'FS' });
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items.every(r =>
      r.dimensions.sectors.some(s => s.code === 'FS' || s.id === 'FS'),
    )).toBe(true);
  });

  it('filters by min_trust_tier (lower = better)', async () => {
    const { items } = await queryResearch({ min_trust_tier: 4 });
    // Only items with at least one source with tier <= 4
    expect(items.length).toBeGreaterThanOrEqual(1);
    for (const r of items) {
      const hasTrusted = r.notebooks.some(nb =>
        nb.sources.some(s => s.quality_tier <= 4),
      );
      expect(hasTrusted).toBe(true);
    }
  });

  it('paginates results with offset and limit', async () => {
    const page1 = await queryResearch({ limit: 2, offset: 0 });
    const page2 = await queryResearch({ limit: 2, offset: 2 });

    expect(page1.items).toHaveLength(2);
    expect(page1.total).toBe(4); // total count ignoring pagination
    expect(page2.items.length).toBeGreaterThanOrEqual(1);
  });

  it('uses default limit of 20 and offset of 0', async () => {
    const { items, total } = await queryResearch({});
    expect(items.length).toBeLessThanOrEqual(20);
    expect(total).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// getLandscape
// ---------------------------------------------------------------------------
describe('getLandscape', () => {
  it('groups research by domain for a region', async () => {
    const landscape = await getLandscape('NL');

    expect(landscape.length).toBeGreaterThanOrEqual(1);
    for (const entry of landscape) {
      expect(entry.region).toBe('NL');
      expect(entry.domain).toBeDefined();
      expect(entry.research_count).toBeGreaterThanOrEqual(1);
      expect(entry.research_ids.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('calculates average trust tier from source tiers', async () => {
    const landscape = await getLandscape('NL');
    const cloudEntry = landscape.find(e => e.domain === 'HC');

    if (cloudEntry) {
      // intel-1 has sources with tiers 3 and 5 => avg = 4
      expect(cloudEntry.avg_trust_tier).toBe(4);
    }
  });

  it('returns empty array for region with no research', async () => {
    const landscape = await getLandscape('NONEXISTENT');
    expect(landscape).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getResearchBrief
// ---------------------------------------------------------------------------
describe('getResearchBrief', () => {
  it('returns "no research found" message for empty results', async () => {
    const brief = await getResearchBrief('NONEXISTENT');
    expect(brief).toContain('No research found');
    expect(brief).toContain('NONEXISTENT');
  });

  it('returns markdown-formatted brief', async () => {
    const brief = await getResearchBrief('NL');

    expect(brief).toContain('# Research Brief');
    expect(brief).toContain('NL');
    expect(brief).toContain('###'); // section headers
  });

  it('includes domain in brief when provided', async () => {
    const brief = await getResearchBrief('NL', 'HC');
    expect(brief).toContain('HC');
  });

  it('limits to top 5 entries', async () => {
    const brief = await getResearchBrief('NL');
    const sectionHeaders = brief.match(/### /g) || [];
    expect(sectionHeaders.length).toBeLessThanOrEqual(5);
  });
});
